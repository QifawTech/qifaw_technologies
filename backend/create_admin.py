"""
Secure first-admin creation command.
Usage (PowerShell):
    python create_admin.py
It will prompt for email and password (password is hidden).
No public registration endpoint exists — this is the only way in.
"""
import getpass
import re
import sys
from werkzeug.security import generate_password_hash
from db import init_pool, query_one, execute

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def main():
    init_pool()
    print("=== Create initial admin ===")
    name = input("Name: ").strip()
    email = input("Email: ").strip().lower()
    if not name or not EMAIL_RE.match(email):
        print("Invalid name or email."); sys.exit(1)

    existing = query_one("SELECT id FROM admins WHERE email=%s", (email,))
    if existing:
        print("Admin with this email already exists."); sys.exit(1)

    pwd1 = getpass.getpass("Password (min 8 chars): ")
    pwd2 = getpass.getpass("Confirm password: ")
    if pwd1 != pwd2 or len(pwd1) < 8:
        print("Passwords do not match or too short."); sys.exit(1)

    pw_hash = generate_password_hash(pwd1)
    admin_id, _ = execute(
        "INSERT INTO admins (name, email, password_hash) VALUES (%s, %s, %s)",
        (name, email, pw_hash)
    )
    print(f"✅ Admin created (id={admin_id}). You can now log in.")

if __name__ == "__main__":
    main()