import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page-wrap">
      <div className="container empty">
        <h1 style={{ fontSize: "5rem", color: "var(--gold)" }}>404</h1>
        <h3>Page Not Found</h3>
        <p>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-gold" style={{ marginTop: 16 }}>Back to Home</Link>
      </div>
    </div>
  );
}
