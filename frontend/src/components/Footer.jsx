import { Link } from "react-router-dom";
import { useState } from "react";
import { Icon } from "./Icons";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const subscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Thanks for subscribing to Sharanee.");
      setEmail("");
    }
  };

  return (
    <footer className="footer">
      <div className="news">
        <div className="container">
          <h3>Subscribe Our Newsletter</h3>
          <form onSubmit={subscribe}>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">
              Explore More <Icon.Arrow />
            </button>
          </form>
        </div>
      </div>

      <div className="foot-main">
        <div className="container foot-grid">
          <div className="foot-brand">
            <img src="/logo.png" alt="Sharanee" />
            <p>
              Sharanee crafts timeless saree inskirts and ethnic wear rooted in
              tradition, tailored for every celebration and every woman.
            </p>
            <div className="contact">
              <div><Icon.Phone /> (307) 555-0133</div>
              <div><Icon.Mail /> designer@sharanee.com</div>
            </div>
            <div className="foot-social">
              <a href="#" aria-label="Facebook"><Icon.Facebook/></a>
              <a href="#" aria-label="Twitter"><Icon.X/></a>
              <a href="#" aria-label="Instagram"><Icon.Instagram/></a>
              <a href="#" aria-label="YouTube"><Icon.Youtube/></a>
            </div>
          </div>

          <div className="foot-col">
            <h4>Categories</h4>
            <Link to="/shop">Saree Inskirt</Link>
            <Link to="/shop"> Designer Sarees</Link>
            <Link to="/shop">Fusion Wear</Link>
            <Link to="/shop">Traditional Gown</Link>
            <Link to="/shop">Kurta Set</Link>
          </div>

          <div className="foot-col">
            <h4>The Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/blog">Blog</Link>
            <a href="#">Press</a>
            <a href="#">Sustainability</a>
            <a href="#">Runways</a>
            <a href="#">Careers</a>
          </div>

          <div className="foot-col">
            <h4>Need Help?</h4>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Book an Appointment</a>
            <a href="#">Shipping</a>
            <a href="#">FAQ's</a>
            <a href="#">Stock Locator</a>
          </div>

          <div className="foot-col">
            <h4>Legal</h4>
            <a href="#">Privacy & Policies</a>
            <a href="#">Fees and Payment</a>
            <a href="#">Terms and Conditions</a>
          </div>
        </div>
      </div>

      <div className="foot-bottom">
        © {new Date().getFullYear()} Sharanee — Saree Inskirt. All Rights Reserved.
      </div>
    </footer>
  );
}
