import mysql.connector
from mysql.connector import pooling
from config import Config

_pool = None


def init_pool():
    global _pool
    if _pool is not None:
        return
    _pool = pooling.MySQLConnectionPool(
        pool_name="it_company_pool",
        pool_size=15,                   # ← increased from 5
        pool_reset_session=True,
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        charset="utf8mb4",
        use_pure=True,
        auth_plugin="mysql_native_password",
        connection_timeout=10,
    )


def get_connection():
    if _pool is None:
        init_pool()
    return _pool.get_connection()


def _close(conn, cur=None):
    """Return connection to pool safely."""
    try:
        if cur is not None:
            cur.close()
    except Exception:
        pass
    try:
        if conn is not None and conn.is_connected():
            conn.close()
    except Exception:
        pass


def query_one(sql, params=()):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        return cur.fetchone()
    finally:
        _close(conn, cur)


def query_all(sql, params=()):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(sql, params)
        return cur.fetchall()
    finally:
        _close(conn, cur)


def execute(sql, params=()):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        return cur.lastrowid, cur.rowcount
    except Exception:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        raise
    finally:
        _close(conn, cur)