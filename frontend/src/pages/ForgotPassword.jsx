import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-sub">Enter your email to receive a reset link</p>
        {sent ? (
          <p style={{ textAlign: "center", color: "var(--success)" }}>
            A reset link has been sent. Please check your inbox.
          </p>
        ) : (
          <form onSubmit={submit}>
            <div className="field"><label htmlFor="fp-email">Email</label><input id="fp-email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></div>
            <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Sending…" : "Send Reset Link"}</button>
          </form>
        )}
        <div className="auth-foot"><Link to="/login">Back to Sign In</Link></div>
      </div>
    </div>
  );
}
