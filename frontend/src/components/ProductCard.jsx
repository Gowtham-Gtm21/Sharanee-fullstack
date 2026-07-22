import { Link, useNavigate } from "react-router-dom";
import { imageUrl } from "../api/client";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // Is this product already in the wishlist? (find the wishlist entry)
  const wishEntry = wishlist.find((w) => w.product?._id === product._id);
  const wished = Boolean(wishEntry);

  const imgs = product.images?.length ? product.images.map(imageUrl) : [];
  const img = imgs[0] || "https://placehold.co/500x650/efe6d5/3f2317?text=Sharanee";
  const hover = imgs[1] || img;

  const hasSale = product.discountPrice && product.discountPrice > 0;
  const shown = hasSale ? product.discountPrice : product.price;
  const off = hasSale ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const oos = product.stockStatus === "Out of Stock";

  const requireLogin = () => { toast.info("Please sign in to continue."); navigate("/login"); return false; };

  const handleCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return requireLogin();
    if (oos) { toast.error("This item is sold out."); return; }
    try { await addToCart(product._id, 1); toast.success("Added to bag."); }
    catch { toast.error("Could not add to bag."); }
  };
  const handleWish = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return requireLogin();
    try {
      if (wished) {
        await removeFromWishlist(wishEntry._id);
        toast.info("Removed from wishlist.");
      } else {
        await addToWishlist(product._id);
        toast.success("Saved to wishlist.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update wishlist.");
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="pcard">
      <div className="pcard-media">
        <div className="pcard-tags">
          {hasSale && <span className="badge badge-sale">{off}% Off</span>}
          {product.featured && !hasSale && <span className="badge">New</span>}
        </div>
        {oos && <span className="pcard-oos">Sold Out</span>}
        <img className="pcard-img base" src={img} alt={product.productName} loading="lazy" />
        {imgs[1] && <img className="pcard-img hover" src={hover} alt="" loading="lazy" />}
        <div className="pcard-actions">
          <button
            onClick={handleWish}
            className={wished ? "wished" : ""}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
          >
            {wished ? <Icon.HeartFill size={18} /> : <Icon.Wishlist size={18} />}
          </button>
          <button onClick={handleCart} aria-label="Add to bag"><Icon.Cart size={18} /></button>
        </div>
      </div>
      <div className="pcard-body">
        <span className="pcard-cat">{product.category?.categoryName || product.occasion || "Sharanee"}</span>
        <h3 className="pcard-name">{product.productName}</h3>
        <div className="pcard-price">
          <span className="price">Rs. {shown?.toLocaleString("en-IN")}</span>
          {hasSale && <span className="strike">Rs. {product.price?.toLocaleString("en-IN")}</span>}
        </div>
      </div>
    </Link>
  );
}
