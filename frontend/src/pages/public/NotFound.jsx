import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1 style={{ fontSize: "6rem", color: "var(--charcoal)" }}>404</h1>
      <p className="text-muted mb-4">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn btn-lime">Back to Home</Link>
    </div>
  );
}