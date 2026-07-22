import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icons";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", comment: "" });
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = (e) => {
    e.preventDefault();
    toast.success("Thank you — we'll be in touch shortly.");
    setForm({ name: "", email: "", phone: "", subject: "", comment: "" });
  };

  return (
    <>
      <div className="crumb"><div className="container"><Link to="/">Home</Link><span className="sep">›</span>Contact</div></div>
      <div className="page-wrap">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <span className="eyebrow">Get in Touch</span>
              <h1 style={{ fontSize: "2.4rem", marginTop: 8 }}>Contact Us</h1>
              <p style={{ color: "var(--muted)", marginBottom: 30 }}>We'd love to help you find the perfect piece for your celebration.</p>
              <div className="ci">
                <span className="k"><Icon.Phone /></span>
                <div><h4>Call Us</h4><p>(307) 555-0133<br />+91 78945 61235</p></div>
              </div>
              <div className="ci">
                <span className="k"><Icon.Mail /></span>
                <div><h4>Email</h4><p>designer@sharanee.com<br />support@sharanee.com</p></div>
              </div>
              <div className="ci">
                <span className="k">◆</span>
                <div><h4>Visit Us</h4><p>Sharanee Boutique, Shop No. 12–14,<br />Crystal Plaza, Anna Nagar,<br />Chennai, Tamil Nadu 600040.</p></div>
              </div>
            </div>

            <form className="contact-form" onSubmit={submit}>
              <h3 style={{ fontSize: "1.7rem" }}>Every Story Begins with Hello</h3>
              <div className="form-2col">
                <div className="field"><label>Name</label><input required {...f("name")} /></div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1000000000"
                    max="9999999999"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                  />
                </div>
              </div>
              <div className="field"><label>Email</label><input type="email" required {...f("email")} /></div>
              <div className="field"><label>Subject</label><input {...f("subject")} /></div>
              <div className="field"><label>Comment</label><textarea rows="4" required {...f("comment")} /></div>
              <button className="btn btn-gold">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
