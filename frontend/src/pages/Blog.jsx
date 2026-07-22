import { useState } from "react";
import { Link } from "react-router-dom";
import { BLOGS, BLOG_CATEGORIES } from "../data/blogData";
import { Icon } from "../components/Icons";

export default function Blog() {
  const [cat, setCat] = useState("All");
  const posts = cat === "All" ? BLOGS : BLOGS.filter((b) => b.category === cat);
  const [featured, ...rest] = posts;

  return (
    <>
      <div className="crumb"><div className="container"><Link to="/">Home</Link><span className="sep">›</span>Blog</div></div>
      <div className="container">
        <div className="about-hero" style={{ paddingBottom: 20 }}>
          <span className="eyebrow">The Sharanee Journal</span>
          <h1 style={{ fontSize: "3rem" }}>Stories of Craft, Culture &amp; Style</h1>
          <p>Draping guides, weave stories, and wedding inspiration from our atelier.</p>
        </div>

        <div className="blog-tabs">
          {BLOG_CATEGORIES.map((c) => (
            <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {featured && (
          <Link to={`/blog/${featured.slug}`} className="blog-feature">
            <div className="blog-feature-img"><img src="https://ps-vastra.myshopify.com/cdn/shop/files/co-ordset-collection.webp?crop=center&height=495&v=1773206744&width=613" alt={featured.title} /></div>
            <div className="blog-feature-copy">
              <span className="eyebrow">{featured.category}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <small>{featured.date} · {featured.author}</small>
              <span className="blog-read">Read Article <Icon.Arrow /></span>
            </div>
          </Link>
        )}

        <div className="blog-grid">
          {rest.map((b) => (
            <Link to={`/blog/${b.slug}`} className="blog-card" key={b.slug}>
              <div className="blog-card-img"><img src={b.cover} alt={b.title} /></div>
              <div className="blog-card-body">
                <span className="pcard-cat">{b.category}</span>
                <h3>{b.title}</h3>
                <p>{b.excerpt}</p>
                <small>{b.date}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
