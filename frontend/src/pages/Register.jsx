import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      // Auto sign-in after successful registration
      try {
        const u = await login(form.email, form.password);
        toast.success(`Welcome to Sharanee, ${u.fullName.split(" ")[0]}.`);
        navigate("/");
      } catch {
        toast.success("Account created. Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-visual">
        <div className="auth-visual-in">
          <span className="eyebrow" style={{ color: "var(--gold-pale)" }}>Sharanee</span>
          <h2>Join a world of handcrafted elegance</h2>
          <p>Create an account for a faster checkout, order tracking, and a personalised wishlist.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <Link to="/" className="brand" style={{ display: "block", textAlign: "center" }}>
            <img src="/logo.png" alt="Sharanee" style={{ margin: "0 auto" }} />
          </Link>
          <h2>Create Account</h2>
          <p className="auth-sub">It only takes a minute</p>
          <form onSubmit={submit} autoComplete="on" name="register">
            <div className="field">
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" name="name" autoComplete="name" required {...f("fullName")} placeholder="Your full name" />
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" autoComplete="email" required {...f("email")} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="reg-phone">Phone</label>
              <input
                id="reg-phone"
                name="phone"
                type="number"
                inputMode="numeric"
                autoComplete="tel"
                required
                min="1000000000"
                max="9999999999"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                placeholder="10-digit mobile"
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <div className="pw-wrap">
                <input id="reg-password" name="password" type={show ? "text" : "password"} autoComplete="new-password"
                  required minLength={6} {...f("password")} placeholder="At least 6 characters" />
                <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
              </div>
            </div>
            <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Creating…" : "Create Account"}</button>
          </form>
          <div className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
