import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, categoryApi } from "../api/endpoints";
import { imageUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import { Icon } from "../components/Icons";

const HERO =
  "https://ps-vastra.myshopify.com/cdn/shop/files/Adobe_Express_-_file_1.png?crop=center&height=870&v=1777716059&width=882";
const CAT_FALLBACK = [
  { name: "Saree Inskirt", img: "https://ps-vastra.myshopify.com/cdn/shop/collections/Saree_f21a0b8d-af7e-4925-aa0c-6795f26f90d3.webp?v=1775470531" },
  { name: "Designer Sarees", img: "https://ps-vastra.myshopify.com/cdn/shop/collections/lehnga_Set.webp?v=1773202620" },
  { name: "Cotton Sarees", img: "https://ps-vastra.myshopify.com/cdn/shop/collections/indo_western.webp?v=1773202846" },
  { name: "Bridal Sarees", img: "https://ps-vastra.myshopify.com/cdn/shop/collections/gown.webp?v=1773202521" },
  { name: "Silk Sarees", img: "https://ps-vastra.myshopify.com/cdn/shop/collections/Suit_Set.webp?v=1773202954" },
];
const SPLIT1 = "https://ps-vastra.myshopify.com/cdn/shop/files/banner-2.webp?crop=center&height=519&v=1773204920&width=832";
const SPLIT2 = "https://ps-vastra.myshopify.com/cdn/shop/files/3.webp?crop=center&height=642&v=1773206251&width=496";

const TESTIMONIALS = [
  { name: "Sophia Williams", date: "March 11, 2026", text: "Beautiful floral embroidered inskirt with a soft pastel color that gives a very elegant look. The finish and flow feel truly premium." },
  { name: "Grace Turner", date: "December 11, 2025", text: "Absolutely stunning drape with vibrant color and elegant flare. The stitching and fall give it a very royal feel." },
  { name: "Charlotte Davis", date: "September 21, 2025", text: "This piece is absolutely gorgeous with its rich color and refined detailing. It adds a modern, stylish touch." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, l, c] = await Promise.all([
          productApi.list({ featured: "true" }),
          productApi.list({ sort: "newest" }),
          categoryApi.list(),
        ]);
        setFeatured((f.data.products || []).slice(0, 4));
        setLatest((l.data.products || []).slice(0, 8));
        setCats(c.data.categories || []);
      } catch {
        /* backend offline — sections gracefully empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mostLoved = featured.length ? featured : latest.slice(0, 4);
  const vogue = latest.slice(4, 8);

  const catTiles = (cats.length ? cats.slice(0, 5).map((c) => ({
    name: c.categoryName,
    img: c.categoryImage ? imageUrl(c.categoryImage) : null,
  })) : CAT_FALLBACK);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="catArch" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 C0.62,0.055 0.65,0.090 0.585,0.105 C0.645,0.085 0.725,0.115 0.735,0.18 C0.805,0.17 0.885,0.205 0.885,0.275 C0.945,0.285 1,0.325 1,0.395 L1,1 L0,1 L0,0.395 C0,0.325 0.055,0.285 0.115,0.275 C0.115,0.205 0.195,0.17 0.265,0.18 C0.275,0.115 0.355,0.085 0.415,0.105 C0.35,0.090 0.38,0.055 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>
      {/* HERO */}
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(63,35,23,0.55), rgba(63,35,23,0.1)), url(${HERO})` }}>
        <div className="container">
          <div className="hero-inner">
            <span className="eyebrow" style={{ color: "var(--gold-pale)" }}>
              Crafted for Every Celebration
            </span>
            <h1>Crafted for Modern Royaltyyyy</h1>
            <p>Timeless designs rooted in tradition, crafted for every celebration.</p>
            <Link to="/shop" className="btn btn-gold">
              Explore <Icon.Arrow />
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="feature-row">
          <div className="cell">
            <span className="fi">✦</span>
            <div><h4>Heritage Craftsmanship</h4><p>Timeless heritage, crafted with masterful precision.</p></div>
          </div>
          <div className="cell">
            <span className="fi">✧</span>
            <div><h4>Premium Fabrics</h4><p>Luxurious materials for lasting comfort.</p></div>
          </div>
          <div className="cell">
            <span className="fi">❉</span>
            <div><h4>Modern Elegance</h4><p>Contemporary silhouettes with a classic soul.</p></div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Shop By Category</h2>
            <p>Where heritage artistry meets modern elegance, crafted to reflect your unique style.</p>
          </div>
          <div className="cat-grid">
            {catTiles.map((c, i) => (
              <Link to={`/shop?search=${encodeURIComponent(c.name)}`} className="cat-tile" key={i}>
                <div className="cat-arch-frame">
                  <div className="cat-arch-inner">
                    <img src={c.img || CAT_FALLBACK[i % CAT_FALLBACK.length].img} alt={c.name} />
                  </div>
                </div>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT BANNER 1 */}
      <section className="section" style={{ background: "var(--ivory)", paddingTop: 40 }}>
        <div className="container">
          <div className="split">
            <div className="split-media"><img src={SPLIT1} alt="Where moments turn majestic" /></div>
            <div className="split-copy">
              <span className="eyebrow">In Sharanee</span>
              <h2>Where Moments Turn Majestic</h2>
              <p>Intricate detailing and elevated silhouettes define a collection rooted in timeless couture and modern elegance.</p>
              <Link to="/shop" className="btn btn-gold">Explore Now <Icon.Arrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* MOST LOVED */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Bestsellers</span>
            <h2>Most Loved Styles</h2>
            <p>Signature creations shaped by heritage, refined for the contemporary muse.</p>
          </div>
          {loading ? <div className="spinner" /> : (
            <div className="grid-cards">
              {mostLoved.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          {!loading && mostLoved.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>
              No products yet — add some from the admin panel.
            </p>
          )}
        </div>
      </section>

      {/* SPLIT BANNER 2 */}
      <section className="section" style={{ background: "var(--ivory)" }}>
        <div className="container">
          <div className="split rev">
            <div className="split-media"><img src={SPLIT2} alt="Timeless Banarasi elegance" /></div>
            <div className="split-copy">
              <span className="eyebrow">Banarasi Collection</span>
              <h2>Timeless Banarasi Elegance</h2>
              <p>Experience the grandeur of traditional Banarasi weaves in pure silk and adorned with detailed zari work — designed to elevate every wedding and festive occasion.</p>
              <Link to="/shop" className="btn">Discover More <Icon.Arrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* CURRENTLY IN VOGUE */}
      {vogue.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">New Arrivals</span>
              <h2>Currently in Vogue</h2>
              <p>Contemporary designs redefining modern Indian elegance, crafted for every special occasion.</p>
            </div>
            <div className="grid-cards">
              {vogue.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="section" style={{ background: "var(--ivory)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Testimonials</span>
            <h2>What Our Customers Say</h2>
            <p>Experiences shared by those who chose timeless craftsmanship and refined style.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="testi" key={i}>
                <div className="testi-top">
                  <div className="testi-name">{t.name}<small>{t.date}</small></div>
                  <div className="testi-stars">
                    {[...Array(5)].map((_, s) => <Icon.Star key={s} fill />)}
                  </div>
                </div>
                <p>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}