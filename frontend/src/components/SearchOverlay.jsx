import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../api/endpoints";
import { imageUrl } from "../api/client";
import { Icon } from "./Icons";

const POPULAR = ["Saree", "Lehenga", "Banarasi", "Silk", "Bridal", "Kurta Set"];

export default function SearchOverlay({ onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Live preview (debounced)
  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      productApi.list({ search: q.trim() })
        .then((r) => setResults((r.data.products || []).slice(0, 5)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Submitting only ever routes to the shop page with the query
  const submit = (term) => {
    const s = (term ?? q).trim();
    if (!s) return;
    navigate(`/shop?search=${encodeURIComponent(s)}`);
    onClose();
  };

  return (
    <div className="search-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button className="search-x" onClick={onClose} aria-label="Close search"><Icon.Close size={26} /></button>

      <div className="search-panel">
        <span className="search-eyebrow">Search Sharanee</span>
        <form className="search-box" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <Icon.Search size={22} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for sarees, lehengas, gowns…"
            aria-label="Search products"
          />
          {q && <button type="button" className="search-clear" onClick={() => setQ("")}><Icon.Close size={18} /></button>}
        </form>

        {!q && (
          <div className="search-popular">
            <span>Popular searches</span>
            <div className="search-tags">
              {POPULAR.map((p) => (
                <button key={p} onClick={() => submit(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {q && (
          <div className="search-results">
            {loading && <div className="spinner" style={{ margin: "24px auto" }} />}
            {!loading && results.length === 0 && (
              <p className="search-none">No matches for “{q}”. Press Enter to browse the shop.</p>
            )}
            {!loading && results.map((p) => (
              <button key={p._id} className="search-hit" onClick={() => { navigate(`/product/${p._id}`); onClose(); }}>
                <img src={p.images?.[0] ? imageUrl(p.images[0]) : "https://placehold.co/60x76/efe6d5/3f2317?text=S"} alt="" />
                <div>
                  <b>{p.productName}</b>
                  <small>{p.category?.categoryName || p.occasion || "Sharanee"}</small>
                </div>
                <span className="price">Rs. {(p.discountPrice > 0 ? p.discountPrice : p.price)?.toLocaleString("en-IN")}</span>
              </button>
            ))}
            {!loading && results.length > 0 && (
              <button className="search-all" onClick={() => submit()}>
                View all results for “{q}” <Icon.Arrow />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
