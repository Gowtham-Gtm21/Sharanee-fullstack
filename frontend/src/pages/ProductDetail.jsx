import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { productApi, reviewApi } from "../api/endpoints";
import { imageUrl } from "../api/client";
import { Icon } from "../components/Icons";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import "../styles/ProductDetails.css";


export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const colorFromUrl = searchParams.get("color");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, addToWishlist } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [tab, setTab] = useState("desc");
  const [canReview, setCanReview] = useState(false);
  const loadReviews = () => reviewApi.forProduct(id).then((r) => setReviews(r.data.reviews || [])).catch(() => { });

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    productApi.get(id)
      .then((r) => {
        const p = r.data.product;
        setProduct(p);
        console.log("Product Data:", p);
        console.log("Color Variants:", p.colorVariants);
        setActive(0);
        setQty(1);
        const matchedColor = colorFromUrl
          ? p.colorVariants?.find(
            (c) =>
              c.colorName?.toLowerCase() === colorFromUrl.toLowerCase()
          )
          : null;

        setSelectedColor(matchedColor || null);

        if (matchedColor?.sizes?.length > 0) {
          setSelectedSize(matchedColor.sizes[0]);
        } else if (p.size?.length > 0) {
          setSelectedSize(p.size[0]);
        } else {
          setSelectedSize("");
        }
        // related: same category
        const catId = p.category?._id || p.category;
        if (catId) {
          productApi.list({ category: catId }).then((rr) => {
            setRelated((rr.data.products || []).filter((x) => x._id !== p._id).slice(0, 4));
          }).catch(() => { });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    loadReviews();

    if (user) {
      reviewApi
        .canReview(id)
        .then((res) => setCanReview(res.data.canReview))
        .catch(() => setCanReview(false));
    }

    // eslint-disable-next-line
  }, [id, colorFromUrl]);

  if (loading) return <div className="spinner" />;
  if (!product) return <div className="empty"><h3>Product not found</h3><Link className="btn" to="/shop">Back to Shop</Link></div>;

  const defaultImages =
    product.colorVariants?.[0]?.images?.length
      ? product.colorVariants[0].images.map(imageUrl)
      : [];

  const imgs =
    selectedColor?.images?.length
      ? selectedColor.images.map(imageUrl)
      : defaultImages.length
        ? defaultImages
        : [
          "https://placehold.co/600x800/efe6d5/3f2317?text=Sharanee",
        ];
  const thumbs = imgs.slice(0, 5);

  const hasSale = product.discount;
  const shown = product.finalPrice || product.price;
  const original = product.originalPrice || product.price;
  const save = original - shown;
  const oos = product.stockStatus === "Out of Stock";
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  const guard = () => { if (!user) { toast.info("Please sign in first."); navigate("/login"); return false; } return true; };
  const bag = async () => {
    if (!guard()) return;
    if (oos) return toast.error("Sold out.");

    if (selectedColor?.sizes?.length > 0 && !selectedSize) {
      return toast.error("Please select a size.");
    }

    try {
      await addToCart(
        product._id,
        qty,
        selectedColor?.colorName,
        selectedSize
      );

      toast.success("Added to bag.");
    } catch {
      toast.error("Could not add.");
    }
  };
  const buyNow = async () => {
    if (!guard()) return;
    if (oos) return toast.error("Sold out.");

    if (selectedColor?.sizes?.length > 0 && !selectedSize) {
      return toast.error("Please select a size.");
    }

    try {
      await addToCart(
        product._id,
        qty,
        selectedColor?.colorName,
        selectedSize
      );

      navigate("/cart");
    } catch {
      toast.error("Could not proceed.");
    }
  };
  const wish = async () => { if (!guard()) return; try { await addToWishlist(product._id); toast.success("Saved to wishlist."); } catch (e) { toast.error(e.response?.data?.message || "Already saved."); } };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!guard()) return;
    try {
      await reviewApi.add({ user: user.id, product: product._id, rating, review: reviewText });
      toast.success("Thank you for your review.");
      setReviewText(""); loadReviews();
    } catch (err) { toast.error(err.response?.data?.message || "Could not add review."); }
  };

  return (
    <>
      <div className="crumb">
        <div className="container">
          <Link to="/">Home</Link><span className="sep">›</span>
          <Link to="/shop">Shop</Link><span className="sep">›</span>
          {product.productName}
        </div>
      </div>

      <div className="container">
        <div className="pdp">
          {/* Gallery: main image + up to 5 thumbnails below */}
          <div className="pdp-gallery">

            <div className="pdp-thumbs">
              {thumbs.map((im, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${i === active ? "active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <img src={im} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className="pdp-main">
              {hasSale && (
                <span className="badge badge-sale">
                  {product.discount.discountType === "Percentage"
                    ? `${product.discount.discountValue}% OFF`
                    : `₹${product.discount.discountValue} OFF`}
                </span>
              )}

              <img src={imgs[active]} alt={product.productName} />
            </div>

          </div>

          {/* Info */}
          <div className="pdp-info">
            <span className="pdp-cat">{product.category?.categoryName || product.occasion}</span>
            <h1>{product.productName}</h1>

            <div className="pdp-rating">
              <span className="stars">{[...Array(5)].map((_, s) => <Icon.Star key={s} size={16} fill={s < Math.round(avg)} />)}</span>
              <span className="pdp-rating-txt">{reviews.length ? `${avg.toFixed(1)} (${reviews.length} review${reviews.length > 1 ? "s" : ""})` : "No reviews yet"}</span>
            </div>

            <div className="pdp-price">
              <span className="price">
                Rs. {shown?.toLocaleString("en-IN")}
              </span>

              {hasSale && (
                <span className="strike">
                  Rs. {original?.toLocaleString("en-IN")}
                </span>
              )}

              {hasSale && (
                <span className="pdp-save">
                  You save Rs. {save.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="pdp-tax">Inclusive of all taxes</p>

            <p className="pdp-desc">{product.description}</p>

            <div className="pdp-meta">
              {product.fabric && (
                <div className="pdp-meta-item">
                  <b>FABRIC</b>

                  <div className="pdp-value">
                    {product.fabric}
                  </div>
                </div>
              )}
              <div className="pdp-meta-item">
                <b>Color</b>

                <div className="color-options">

                  {/* <button
                    type="button"
                    className={
                      selectedColor === null
                        ? "color-btn active"
                        : "color-btn"
                    }
                    onClick={() => {
                      setSelectedColor(null);
                      setActive(0);
                    }}
                  >
                    Default
                  </button> */}

                  {product.colorVariants?.map((c, index) => (

                    <button
                      key={index}
                      type="button"
                      className={
                        selectedColor?.colorName === c.colorName
                          ? "color-btn active"
                          : "color-btn"
                      }
                      onClick={() => {
                        setSelectedColor(c);
                        setActive(0);

                        if (c.sizes?.length > 0) {
                          setSelectedSize(c.sizes[0]);
                        } else {
                          setSelectedSize("");
                        }
                      }}
                    >
                      <span
                        className="color-circle"
                        style={{
                          background: c.colorCode,
                        }}
                      />

                      {c.colorName}
                    </button>

                  ))}

                </div>
              </div>
              {product.occasion && (
                <div className="pdp-meta-item">
                  <b>OCCASION</b>

                  <div className="pdp-value">
                    {product.occasion}
                  </div>
                </div>
              )}


              <div className="pdp-meta-item">
                <b>Size</b>

                <div className="size-options">
                  {(selectedColor?.sizes || product.size || []).map((size) => (
                    <button
                      key={size}
                      className={
                        selectedSize === size
                          ? "size-btn active"
                          : "size-btn"
                      }
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>


              <div className="pdp-meta-item">
                <b>AVAILABILITY</b>

                <div
                  className="pdp-value"
                  style={{
                    color: oos ? "var(--danger)" : "var(--success)"
                  }}
                >
                  {product.stockStatus}
                </div>
              </div>
              <div className="pdp-meta-item">
                <b>BRAND</b>

                <div className="pdp-value">
                  {product.brand}
                </div>
              </div>
            </div>

            <div className="pdp-buy">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
              </div>
              <button className="btn btn-block-grow" onClick={bag} disabled={oos}><Icon.Cart size={18} /> Add to CART</button>
            </div>
            <div className="pdp-buy2">
              <button className="btn btn-gold" onClick={buyNow} disabled={oos}>Buy Now</button>
              <button className="btn btn-outline" onClick={wish}><Icon.Wishlist size={18} /> Wishlist</button>
            </div>

            <div className="pdp-trust">
              <div><Icon.Truck /> <span>Free shipping over Rs. 999</span></div>
              <div><Icon.Refresh /> <span>7-day easy returns</span></div>
              <div><Icon.Shield /> <span>Secure checkout</span></div>
            </div>
          </div>
        </div>

        {/* Tabs: description / details / reviews */}
        <div className="pdp-tabs">
          <div className="pdp-tabbar">
            <button className={tab === "desc" ? "on" : ""} onClick={() => setTab("desc")}>Description</button>
            <button className={tab === "care" ? "on" : ""} onClick={() => setTab("care")}>Fabric &amp; Care</button>
            <button className={tab === "rev" ? "on" : ""} onClick={() => setTab("rev")}>Reviews ({reviews.length})</button>
          </div>

          {tab === "desc" && (
            <div className="pdp-panel">
              <p>{product.description || "A timeless Sharanee creation, crafted with premium fabric and detailed finishing for every celebration."}</p>
            </div>
          )}
          {tab === "care" && (
            <div className="pdp-panel">
              <p>{product.fabric ? `Made from ${product.fabric.toLowerCase()}.` : ""} Dry clean recommended. Store folded in a cool, dry place away from direct sunlight. Iron on low heat; avoid direct contact with embellishments.</p>
            </div>
          )}
          {tab === "rev" && (
            <div className="pdp-panel">

              <div className="review-summary">
                <div className="review-score">
                  <h2>
                    {avg.toFixed(1)}
                    <span>★</span>
                  </h2>
                  <p>{reviews.length} Ratings</p>
                </div>

                <div className="review-title">
                  <h3>Customer Reviews</h3>
                </div>
              </div>

              {reviews.length === 0 && (

                <div className="empty-review">

                  <h3>No Reviews Yet</h3>

                  <p>
                    Be the first customer to review this product.
                  </p>

                </div>

              )}
              {reviews.map((r) => (

                <div className="review-card" key={r._id}>

                  <div className="review-top">

                    <div className="review-user">

                      <div className="avatar">

                        {r.user?.fullName?.charAt(0)}

                      </div>

                      <div>

                        <b>{r.user?.fullName}</b>

                        <p>Verified Customer</p>

                      </div>

                    </div>

                    <div className="stars">
                      {[...Array(5)].map((_, s) => (
                        <Icon.Star
                          key={s}
                          size={16}
                          fill={s < r.rating}
                        />
                      ))}
                    </div>

                  </div>

                  <p className="review-text">

                    {r.review}

                  </p>

                  <small>

                    {new Date(r.createdAt).toLocaleDateString()}

                  </small>

                </div>

              ))}

              {canReview ? (
                <div className="write-review">
                  <form onSubmit={submitReview} className="review-form">
                    <h3>Write a Review</h3>

                    <div className="field">
                      <label>Your Rating</label>
                      <div className="stars pick">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setRating(s)}
                          >
                            <Icon.Star size={24} fill={s <= rating} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Your Review</label>

                      <textarea
                        rows="3"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Describe quality, fabric, colour and your experience..."
                        required
                      />
                    </div>

                    <button className="btn btn-gold">
                      Submit Your Review
                    </button>
                  </form>
                </div>
              ) : (
                <div className="review-lock">
                  You can review this product only after it has been delivered.
                </div>
              )}

            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="section" style={{ paddingTop: 20 }}>
            <div className="section-head"><span className="eyebrow">You may also like</span><h2>Complete the Look</h2></div>
            <div className="grid-cards">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
