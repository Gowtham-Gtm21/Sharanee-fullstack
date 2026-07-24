import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { couponApi } from "../api/endpoints";
import { imageUrl } from "../api/client";
import { Icon } from "../components/Icons";
import { useToast } from "../context/ToastContext";

export default function Cart() {
  const { cart, cartTotal, updateQty, removeFromCart } = useCart();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const priceOf = (p) => (p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    try {
      const { data } = await couponApi.apply(code.trim(), cartTotal);
      console.log("Coupon Response:", data);
      setDiscount(data.discount);
      setAppliedCode(data.coupon.code);
      toast.success(`Coupon ${data.coupon.code} applied.`);
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      toast.error(err.response?.data?.message || "Invalid coupon.");
    }
  };

  const shipping = cartTotal > 999 || cartTotal === 0 ? 0 : 50;
  const grand = Math.max(0, cartTotal - discount) + shipping;

  if (cart.length === 0) {
    return (
      <div className="page-wrap">
        <div className="container empty">
          <h3>Your bag is empty</h3>
          <p>Discover timeless pieces crafted for every celebration.</p>
          <Link to="/shop" className="btn btn-gold" style={{ marginTop: 16 }}>Continue Shopping <Icon.Arrow /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="crumb" style={{ marginBottom: 24 }}>
        <div className="container"><Link to="/">Home</Link><span className="sep">›</span>Cart</div>
      </div>
      <div className="container">
        <h1 style={{ fontSize: "2.4rem" }}>Shopping Bag</h1>
        <div className="cart-grid">
          <div>
            <table className="cart-table">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  const img = p.images?.[0] ? imageUrl(p.images[0]) : "https://placehold.co/80x100/efe6d5/3f2317?text=S";
                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="cart-prod">
                          <img src={img} alt={p.productName} />
                          <div>
                            <Link to={`/product/${p._id}`}><b>{p.productName}</b></Link>
                            {p.color && <small>Color: {p.color}</small>}
                            <small>by Sharanee</small>
                          </div>
                        </div>
                      </td>
                      <td className="price">Rs. {priceOf(p).toLocaleString("en-IN")}</td>
                      <td>
                        <div className="qty">
                          <button onClick={() => updateQty(item._id, Math.max(1, item.quantity - 1))}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td className="price">Rs. {(priceOf(p) * item.quantity).toLocaleString("en-IN")}</td>
                      <td>
                        <button onClick={() => removeFromCart(item._id)} style={{ background: "none", border: "none", color: "var(--danger)" }}>
                          <Icon.Trash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="summary">
            <h3>Bill Summary</h3>
            <div className="coupon-row">
              <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn" onClick={applyCoupon}>Apply</button>
            </div>
            <div className="summary-row"><span>Subtotal</span><span>Rs. {cartTotal.toLocaleString("en-IN")}</span></div>
            {discount > 0 && <div className="summary-row"><span>Discount ({appliedCode})</span><span style={{ color: "var(--danger)" }}>− Rs. {discount.toLocaleString("en-IN")}</span></div>}
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>Rs. {grand.toLocaleString("en-IN")}</span></div>
            <button className="btn btn-gold btn-block" style={{ marginTop: 16 }} onClick={() => navigate("/checkout", { state: { discount, appliedCode, shipping } })}>
              Checkout <Icon.Arrow />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
