import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addressApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Icon } from "../components/Icons";

const EMPTY = {
  fullName: "", mobile: "", alternateMobile: "", houseNo: "", area: "",
  landmark: "", city: "", state: "", pincode: "", addressType: "Home",
};

export default function Account() {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => addressApi.get(user.id).then((r) => setAddresses(r.data.addresses || [])).catch(() => { });
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await addressApi.update(editing, form); toast.success("Address updated."); }
      else { await addressApi.add({ ...form, user: user.id }); toast.success("Address added."); }
      setForm(EMPTY); setEditing(null); setShowForm(false); load();
    } catch { toast.error("Could not save address."); }
  };

  const edit = (a) => { setForm(a); setEditing(a._id); setShowForm(true); };
  const remove = async (id) => { try { await addressApi.remove(id); toast.success("Address removed."); load(); } catch { toast.error("Could not remove."); } };

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 style={{ fontSize: "2.4rem" }}>My Account</h1>
        <div style={{ display: "flex", gap: 15, marginBottom: 26, flexWrap: "wrap" }}>
          <button className={`btn ${tab === "profile" ? "btn-gold" : "btn-outline"}`} onClick={() => setTab("profile")}>Profile</button>
          {/* Orders and Wishlist — customer only */}
          {!isAdmin && (
            <>
              <button className={`btn ${tab === "address" ? "btn-gold" : "btn-outline"}`} onClick={() => setTab("address")}>Addresses</button>
              <Link to="/orders" className="btn btn-outline">Orders</Link>
              <Link to="/wishlist" className="btn btn-outline">Wishlist</Link>
            </>
          )}
          <button className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => { logout(); navigate("/"); }}>Logout</button>
        </div>

        {tab === "profile" && (
          <div className="order-card" style={{ maxWidth: 480 }}>
            <div className="summary-row"><span>Name</span><b>{user.fullName}</b></div>
            <div className="summary-row"><span>Email</span><b>{user.email}</b></div>
            <div className="summary-row"><span>Phone</span><b>{user.phone}</b></div>
            <div className="summary-row"><span>Account Type</span><b>{user.role === "admin" ? "Admin" : "Customer"}</b></div>
          </div>
        )}

        {tab === "address" && (
          <div style={{ maxWidth: 640 }}>
            {addresses.map((a) => (
              <div className="order-card" key={a._id}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <b>{a.fullName}</b> <span className="status-pill">{a.addressType}</span>
                    <div style={{ color: "var(--cocoa-soft)", fontSize: "0.9rem", marginTop: 4 }}>
                      {a.houseNo}, {a.area}{a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} — {a.pincode}
                    </div>
                    <small style={{ color: "var(--muted)" }}>Mobile: {a.mobile}</small>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <button className="icon-btn" title="Edit" aria-label="Edit address" onClick={() => edit(a)}>
                      <Icon.Edit size={16} />
                    </button>
                    <button className="icon-btn danger" title="Delete" aria-label="Delete address" onClick={() => remove(a._id)}>
                      <Icon.Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!showForm ? (
              <button className="btn btn-gold" onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}>+ Add New Address</button>
            ) : (
              <form onSubmit={save} className="order-card">
                <h4 style={{ fontFamily: "var(--display)" }}>{editing ? "Edit" : "New"} Address</h4>
                <div className="form-2col">
                  <div className="field"><label>Full Name</label><input required {...f("fullName")} /></div>
                  <div className="field"><label>Mobile</label><input required {...f("mobile")} /></div>
                </div>
                <div className="form-2col">
                  <div className="field"><label>House No.</label><input required {...f("houseNo")} /></div>
                  <div className="field"><label>Area</label><input required {...f("area")} /></div>
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
                  <label>Type</label>
                  <select {...f("addressType")}><option>Home</option><option>Work</option><option>Other</option></select>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn">Save</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}