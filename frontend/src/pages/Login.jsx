import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Icon } from "../components/Icons";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.fullName.split(" ")[0]}.`);
      navigate(u.role === "admin" ? "/admin" : (loc.state?.from || "/"), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-visual">
        <div className="auth-visual-in">
          <span className="eyebrow" style={{ color: "var(--gold-pale)" }}>Sharanee</span>
          <h2>Welcome back to timeless elegance</h2>
          <p>Sign in to track orders, save your favourites, and check out faster.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="brand" style={{ display: "block", textAlign: "center" }}>
            <img src="/logo.png" alt="Sharanee" style={{ margin: "0 auto" }} />
          </Link>
          <h2>Sign In</h2>
          <p className="auth-sub">Enter your details to continue</p>
          <form onSubmit={submit} autoComplete="on" name="login">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" name="email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="pw-wrap">
                <input id="login-password" name="password" type={show ? "text" : "password"} autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
              </div>
            </div>
            <div className="auth-link"><Link to="/forgot-password">Forgot password?</Link></div>
            <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
          </form>
          <div className="auth-foot">New to Sharanee? <Link to="/register">Create an account</Link></div>
        </div>
      </div>
    </div>
  );
}
