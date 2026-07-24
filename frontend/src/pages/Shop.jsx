import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productApi, categoryApi } from "../api/endpoints";
import { imageUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import FilterDropdown from "../components/FilterDropdown";
import { Icon } from "../components/Icons";

// Fallback imagery for category circles when a category has no image yet.
const CIRCLE_FALLBACK = [
  "https://ps-vastra.myshopify.com/cdn/shop/collections/Saree_f21a0b8d-af7e-4925-aa0c-6795f26f90d3.webp?crop=center&height=169&v=1775470531&width=169",
  "https://ps-vastra.myshopify.com/cdn/shop/collections/lehnga_Set.webp?crop=center&height=169&v=1773202620&width=169",
  "https://ps-vastra.myshopify.com/cdn/shop/collections/indo_western.webp?crop=center&height=169&v=1773202846&width=169",
  "https://ps-vastra.myshopify.com/cdn/shop/files/ilana2_720x_e39fa542-f3fc-436c-b70a-b4c3638a298f.webp?crop=center&height=169&v=1772428569&width=169",
  "https://ps-vastra.myshopify.com/cdn/shop/collections/kurta_set.webp?crop=center&height=169&v=1773210422&width=169",
  "https://ps-vastra.myshopify.com/cdn/shop/files/Gemini_Generated_Image_exdwmlexdwmlexdw.png?crop=center&height=169&v=1772428583&width=169",
  "https://images.unsplash.com/photo-1610189844537-f6a3d538e0f6?auto=format&fit=crop&w=300&q=80",
];

const PRICE_RANGES = [
  { value: "0-2000", label: "Under Rs. 2,000" },
  { value: "2000-5000", label: "Rs. 2,000 – 5,000" },
  { value: "5000-10000", label: "Rs. 5,000 – 10,000" },
  { value: "10000-999999", label: "Rs. 10,000 & above" },
];

const AVAILABILITY = [
  { value: "in", label: "In Stock" },
  { value: "out", label: "Out of Stock" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [currentImage, setCurrentImage] = useState({});
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "";
  const fabric = params.get("fabric") || "";
  const color = params.get("color") || "";
  const occasion = params.get("occasion") || "";
  const price = params.get("price") || "";
  const availability = params.get("availability") || "";
  const featured = params.get("featured") || "";

  // Categories (for circles + product-type dropdown) and a full product list
  // (for deriving colour/fabric/tag/price options) — fetched once.
  useEffect(() => {
    categoryApi.list().then((r) => setCats(r.data.categories || [])).catch(() => { });
    productApi.list().then((r) => setAllProducts(r.data.products || [])).catch(() => { });
  }, []);



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        const next = { ...prev };

        cats.forEach((cat) => {
          if (cat.categoryImages?.length > 1) {
            next[cat._id] =
              ((prev[cat._id] || 0) + 1) % cat.categoryImages.length;
          }
        });

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [cats]);
  // Fetch the filtered list from the backend whenever a server-side filter changes.
  useEffect(() => {
    setLoading(true);
    const q = {};
    if (search) q.search = search;
    if (category) q.category = category;
    if (sort) q.sort = sort;
    if (fabric) q.fabric = fabric;
    if (color) q.color = color;
    if (occasion) q.occasion = occasion;
    if (featured) q.featured = featured;
    if (price) {
      const [min, max] = price.split("-");
      if (min) q.minPrice = min;
      if (max) q.maxPrice = max;
    }


    productApi.list(q)
      .then((r) => setProducts(r.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, sort, fabric, color, occasion, price, featured]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  // Availability filter is applied client-side (backend has no such param).
  const visible = useMemo(() => {
    if (!availability) return products;
    return products.filter((p) =>
      availability === "out" ? p.stockStatus === "Out of Stock" : p.stockStatus !== "Out of Stock"
    );
  }, [products, availability]);

  // Derive option lists from the full catalogue so options never disappear.
  const opt = (arr) => [...new Set(arr.filter(Boolean))].map((v) => ({ value: v, label: v }));
  const colorOpts = useMemo(() => opt(allProducts.map((p) => p.color)), [allProducts]);
  const fabricOpts = useMemo(() => opt(allProducts.map((p) => p.fabric)), [allProducts]);
  const tagOpts = useMemo(() => opt(allProducts.map((p) => p.occasion)), [allProducts]);
  const catOpts = cats.map((c) => ({ value: c._id, label: c.categoryName }));

  const circles = cats.length
    ? cats.map((c, i) => ({
      id: c._id, name: c.categoryName, img: c.categoryImages?.length
        ? imageUrl(
          c.categoryImages[currentImage[c._id] || 0]
        )
        : CIRCLE_FALLBACK[i % CIRCLE_FALLBACK.length]
    }))
    : ["Saree", "Designer Sarees", "Cotton Sarees", "Bridal Sarees ", "Silk Sarees"].map((n, i) => ({ id: "", name: n, img: CIRCLE_FALLBACK[i % CIRCLE_FALLBACK.length], search: n }));

  const activeChips = [
    category && { k: "category", label: catOpts.find((c) => c.value === category)?.label },
    color && { k: "color", label: color },
    fabric && { k: "fabric", label: fabric },
    occasion && { k: "occasion", label: occasion },
    availability && { k: "availability", label: AVAILABILITY.find((a) => a.value === availability)?.label },
    price && { k: "price", label: PRICE_RANGES.find((p) => p.value === price)?.label },
    search && { k: "search", label: `“${search}”` },
    featured && { k: "featured", label: "Featured" },
  ].filter(Boolean);
  console.log(cats);
  return (
    <>
      <div className="crumb">
        <div className="container">
          <Link to="/">Home</Link><span className="sep">›</span>
          {search ? `Search: ${search}` : category ? (catOpts.find((c) => c.value === category)?.label || "Shop") : "Shop All"}
        </div>
      </div>

      {/* Round category circles */}
      <div className="container">
        <div className="circle-row">
          {circles.map((c, i) => {
            const isActive = c.id ? category === c.id : false;
            const to = c.id ? `?category=${c.id}` : `?search=${encodeURIComponent(c.search)}`;
            return (
              <button
                key={i}
                className={`circle ${isActive ? "active" : ""}`}
                onClick={() => c.id ? setParam("category", isActive ? "" : c.id) : setParam("search", c.search)}
              >
                <span className="circle-img"><img src={c.img} alt={c.name} /></span>
                <span className="circle-label">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>



      {/* Filter bar */}
      <div className="filterbar-wrap">
        <div className="container">
          <div className="filterbar">
            <button className="fb-toggle" onClick={() => setMobileFilters((v) => !v)}>
              <Icon.Filter size={16} /> Filters
            </button>
            <div className={`fb-drops ${mobileFilters ? "show" : ""}`}>
              <FilterDropdown label="Availability" options={AVAILABILITY} value={availability} onChange={(v) => setParam("availability", v)} />
              <FilterDropdown label="Product Type" options={catOpts} value={category} onChange={(v) => setParam("category", v)} />
              <FilterDropdown label="Color" options={colorOpts} value={color} onChange={(v) => setParam("color", v)} />
              <FilterDropdown label="Fabric" options={fabricOpts} value={fabric} onChange={(v) => setParam("fabric", v)} />
              <FilterDropdown label="Tags" options={tagOpts} value={occasion} onChange={(v) => setParam("occasion", v)} />
              <FilterDropdown label="Price" options={PRICE_RANGES} value={price} onChange={(v) => setParam("price", v)} />
            </div>
            <div className="fb-sort">
              <span className="fb-count">{visible.length} items</span>
              <FilterDropdown
                label="Sort by: Featured"
                allLabel="Featured"
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "low", label: "Price: Low to High" },
                  { value: "high", label: "Price: High to Low" },
                ]}
                value={sort}
                onChange={(v) => setParam("sort", v)}
              />
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="chips">
              {activeChips.map((c) => (
                <button key={c.k} className="chip" onClick={() => setParam(c.k, "")}>
                  {c.label} <Icon.Close size={13} />
                </button>
              ))}
              <button className="chip-clear" onClick={clearAll}>Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="container" style={{ padding: "34px 24px 70px" }}>
        {loading ? (
          <div className="spinner" />
        ) : visible.length === 0 ? (
          <div className="empty">
            <h3>Nothing matches those filters</h3>
            <p>Try clearing a filter, or browse the full collection.</p>
            <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={clearAll}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid-cards">
            {visible.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
