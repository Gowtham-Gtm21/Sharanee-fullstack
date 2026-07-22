import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { imageUrl } from "../api/client";
import { Icon } from "../components/Icons";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const toast = useToast();

  if (!user) {
    return <div className="page-wrap"><div className="container empty"><h3>Sign in to view your wishlist</h3><Link className="btn btn-gold" to="/login">Sign In</Link></div></div>;
  }

  const priceOf = (p) => (p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price);

  const moveToBag = async (productId) => {
    try { await addToCart(productId, 1); toast.success("Moved to bag."); }
    catch { toast.error("Could not add to bag."); }
  };

  return (
    <div className="page-wrap">
      <div className="crumb" style={{ marginBottom: 24 }}>
        <div className="container"><Link to="/">Home</Link><span className="sep">›</span>Wishlist</div>
      </div>
      <div className="container">
        <h1 style={{ fontSize: "2.4rem" }}>My Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="empty"><h3>Your wishlist is empty</h3><Link className="btn btn-gold" to="/shop">Explore Collection</Link></div>
        ) : (
          <div className="wish-grid">
            {wishlist.map((w) => w.product && (
              <div key={w._id}>
                <Link to={`/product/${w.product._id}`} className="pcard">
                  <div className="pcard-media">
                    <img src={w.product.images?.[0] ? imageUrl(w.product.images[0]) : "https://placehold.co/400x520/efe6d5/3f2317?text=Sharanee"} alt={w.product.productName} />
                  </div>
                  <div className="pcard-body">
                    <h3 className="pcard-name">{w.product.productName}</h3>
                    <div className="price">Rs. {priceOf(w.product).toLocaleString("en-IN")}</div>
                  </div>
                </Link>
                <button className="btn btn-block" style={{ marginTop: 8 }} onClick={() => moveToBag(w.product._id)}>
                  <Icon.Cart /> Move to Bag
                </button>
                <button className="wish-remove" onClick={() => removeFromWishlist(w._id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
