import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const { token } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success("Password reset successful. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed or link expired.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>New Password</h2>
        <p className="auth-sub">Choose a new password for your account</p>
        <form onSubmit={submit}>
          <div className="field"><label htmlFor="rp-pw">New Password</label><input id="rp-pw" name="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <div className="field"><label htmlFor="rp-cpw">Confirm Password</label><input id="rp-cpw" name="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
          <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Resetting…" : "Reset Password"}</button>
        </form>
        <div className="auth-foot"><Link to="/login">Back to Sign In</Link></div>
      </div>
    </div>
  );
}
