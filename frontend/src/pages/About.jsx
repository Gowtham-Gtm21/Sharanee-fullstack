import { Link } from "react-router-dom";
import { Icon } from "../components/Icons";

const IMGS = [
  "https://ps-vastra.myshopify.com/cdn/shop/files/about-us-1.webp?crop=center&height=453&v=1773212683&width=362",
  "https://ps-vastra.myshopify.com/cdn/shop/files/about-us-2.webp?crop=center&height=453&v=1773212682&width=362",
  "https://ps-vastra.myshopify.com/cdn/shop/files/about-us-3.webp?crop=center&height=453&v=1773212683&width=362",
];

export default function About() {
  return (
    <>
      <div className="crumb"><div className="container"><Link to="/">Home</Link><span className="sep">›</span>About Us</div></div>
      <div className="container">
        <div className="about-hero">
          <span className="eyebrow">Our Story</span>
          <h1 style={{ fontSize: "3rem" }}>Every Saree Tells a Story Inspired by Heritage, Designed with Love</h1>
          <p>Sharanee began with a simple belief — that every woman deserves ethnic wear that feels as timeless as it is personal. From authentic handcrafted sarees to modern inskirts, each piece is designed to celebrate culture, comfort, and craftsmanship.</p>
        </div>

        <div className="about-imgs" style={{ marginBottom: 60 }}>
          {IMGS.map((im, i) => <img key={i} src={im} alt="Sharanee craft" />)}
        </div>

        <div className="split" style={{ paddingBottom: 70 }}>
          <div className="split-copy">
            <span className="eyebrow">Craftsmanship</span>
            <h2>Rooted in Tradition, Crafted for Today</h2>
            <p>Our artisans blend traditional techniques with contemporary silhouettes, using premium fabrics and detailed handwork. Every stitch reflects a story of heritage, and every drape is designed to elevate life's most memorable moments.</p>
            <Link to="/shop" className="btn btn-gold">Explore Collection <Icon.Arrow /></Link>
          </div>
          <div className="split-media">
            <img src="https://ps-vastra.myshopify.com/cdn/shop/files/about-us-7.webp?crop=center&height=469&v=1773212904&width=736" alt="Sharanee atelier" />
          </div>
        </div>
      </div>
    </>
  );
}
