import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addressApi, orderApi, cartApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { imageUrl } from "../api/client";

const EMPTY = {
  fullName: "", mobile: "", alternateMobile: "", houseNo: "", area: "",
  landmark: "", city: "", state: "", pincode: "", addressType: "Home",
};

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartTotal, refreshCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { state } = useLocation();
  const discount = state?.discount || 0;
  const shipping = state?.shipping ?? (cartTotal > 999 ? 0 : 50);

  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [payment, setPayment] = useState("COD");
  const [placing, setPlacing] = useState(false);

  const loadAddresses = () => {
    addressApi.get(user.id).then((r) => {
      setAddresses(r.data.addresses || []);
      if (r.data.addresses?.length && !selected) setSelected(r.data.addresses[0]._id);
      if (!r.data.addresses?.length) setShowForm(true);
    }).catch(() => {});
  };

  useEffect(() => { loadAddresses(); /* eslint-disable-next-line */ }, []);

  const priceOf = (p) => (p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price);
  const grand = Math.max(0, cartTotal - discount) + shipping;

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addressApi.add({ ...form, user: user.id });
      toast.success("Address added.");
      setShowForm(false);
      setForm(EMPTY);
      setSelected(data.address._id);
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save address.");
    }
  };

  const placeOrder = async () => {
    if (!selected) { toast.error("Please select a delivery address."); return; }
    setPlacing(true);
    try {
      const items = cart.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
        price: priceOf(i.product),
      }));
      const { data } = await orderApi.place({
        user: user.id,
        items,
        shippingAddress: selected,
        totalAmount: grand,
        paymentMethod: payment,
      });
      // Clear the cart on the server
      await Promise.all(cart.map((i) => cartApi.remove(i._id)));
      await refreshCart();
      toast.success("Order placed successfully.");
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return <div className="page-wrap"><div className="container empty"><h3>Your bag is empty</h3><Link className="btn" to="/shop">Shop Now</Link></div></div>;
  }

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="page-wrap">
      <div className="crumb" style={{ marginBottom: 24 }}>
        <div className="container"><Link to="/">Home</Link><span className="sep">›</span><Link to="/cart">Cart</Link><span className="sep">›</span>Checkout</div>
      </div>
      <div className="container">
        <h1 style={{ fontSize: "2.4rem" }}>Checkout</h1>
        <div className="cart-grid">
          <div>
            {/* Address */}
            <h3 style={{ fontSize: "1.4rem" }}>Delivery Address</h3>
            {addresses.map((a) => (
              <label key={a._id} className="order-card" style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
                <input type="radio" name="addr" checked={selected === a._id} onChange={() => setSelected(a._id)} style={{ marginTop: 5 }} />
                <div>
                  <b>{a.fullName}</b> <span className="status-pill">{a.addressType}</span>
                  <div style={{ color: "var(--cocoa-soft)", fontSize: "0.9rem", marginTop: 4 }}>
                    {a.houseNo}, {a.area}{a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} — {a.pincode}
                  </div>
                  <small style={{ color: "var(--muted)" }}>Mobile: {a.mobile}</small>
                </div>
              </label>
            ))}

            {!showForm ? (
              <button className="btn btn-outline" onClick={() => setShowForm(true)}>+ Add New Address</button>
            ) : (
              <form onSubmit={saveAddress} className="order-card">
                <h4 style={{ fontFamily: "var(--display)" }}>New Address</h4>
                <div className="form-2col">
                  <div className="field"><label>Full Name</label><input required {...f("fullName")} /></div>
                  <div className="field"><label>Mobile</label><input required {...f("mobile")} /></div>
                </div>
                <div className="form-2col">
                  <div className="field"><label>House / Flat No.</label><input required {...f("houseNo")} /></div>
                  <div className="field"><label>Area / Street</label><input required {...f("area")} /></div>
                </div>
                <div className="form-2col">
                  <div className="field"><label>Landmark</label><input {...f("landmark")} /></div>
                  <div className="field"><label>City</label><input required {...f("city")} /></div>
                </div>
                <div className="form-2col">
                  <div className="field"><label>State</label><input required {...f("state")} /></div>
                  <div className="field"><label>Pincode</label><input required {...f("pincode")} /></div>
                </div>
                <div className="field">
                  <label>Address Type</label>
                  <select {...f("addressType")}>
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn">Save Address</button>
                  {addresses.length > 0 && <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>}
                </div>
              </form>
            )}

            {/* Payment */}
            <h3 style={{ fontSize: "1.4rem", marginTop: 30 }}>Payment Method</h3>
            <label className="order-card" style={{ display: "flex", gap: 12, cursor: "pointer" }}>
              <input type="radio" name="pay" checked={payment === "COD"} onChange={() => setPayment("COD")} />
              <div><b>Cash on Delivery</b><div style={{ color: "var(--muted)", fontSize: "0.86rem" }}>Pay when your order arrives.</div></div>
            </label>
            <label className="order-card" style={{ display: "flex", gap: 12, cursor: "pointer" }}>
              <input type="radio" name="pay" checked={payment === "Razorpay"} onChange={() => setPayment("Razorpay")} />
              <div><b>Pay Online (Razorpay)</b><div style={{ color: "var(--muted)", fontSize: "0.86rem" }}>Secure card / UPI payment.</div></div>
            </label>
          </div>

          <div className="summary">
            <h3>Order Summary</h3>
            {cart.map((i) => i.product && (
              <div className="order-item" key={i._id}>
                <img src={i.product.images?.[0] ? imageUrl(i.product.images[0]) : "https://placehold.co/56x70/efe6d5/3f2317?text=S"} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.86rem" }}>{i.product.productName}</div>
                  <small style={{ color: "var(--muted)" }}>Qty: {i.quantity}</small>
                </div>
                <div className="price" style={{ fontSize: "0.86rem" }}>Rs. {(priceOf(i.product) * i.quantity).toLocaleString("en-IN")}</div>
              </div>
            ))}
            <div className="summary-row" style={{ marginTop: 10 }}><span>Subtotal</span><span>Rs. {cartTotal.toLocaleString("en-IN")}</span></div>
            {discount > 0 && <div className="summary-row"><span>Discount</span><span style={{ color: "var(--danger)" }}>− Rs. {discount.toLocaleString("en-IN")}</span></div>}
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>Rs. {grand.toLocaleString("en-IN")}</span></div>
            <button className="btn btn-gold btn-block" style={{ marginTop: 16 }} onClick={placeOrder} disabled={placing}>
              {placing ? "Placing…" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
