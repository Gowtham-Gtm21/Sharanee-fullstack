import { useEffect, useState } from "react";
import { couponApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";

const EMPTY = {
  code: "", discountType: "Percentage", discountValue: "",
  minimumOrderAmount: "", expiryDate: "",
};

export default function AdminCoupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => couponApi.list().then((r) => setCoupons(r.data.coupons || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const resetForm = () => {
    setForm(EMPTY);
    setEditing(null);
  };

  const startEdit = (coupon) => {
    setEditing(coupon._id);
    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "Percentage",
      discountValue: coupon.discountValue ?? "",
      minimumOrderAmount: coupon.minimumOrderAmount ?? "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await couponApi.update(editing, form);
        toast.success("Coupon updated.");
      } else {
        await couponApi.create(form);
        toast.success("Coupon created.");
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save coupon.");
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await couponApi.remove(id);
      toast.success("Coupon deleted.");
      if (editing === id) resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete coupon.");
    }
  };

  return (
    <>
      <h1>Coupons</h1>
      <div className="admin-cat">
        <form onSubmit={save} className="order-card">
          <h3 style={{ fontSize: "1.3rem" }}>{editing ? "Edit Coupon" : "Create Coupon"}</h3>
          <div className="field"><label>Code</label><input required {...f("code")} placeholder="SHARANEE10" style={{ textTransform: "uppercase" }} /></div>
          <div className="field">
            <label>Discount Type</label>
            <select {...f("discountType")}><option>Percentage</option><option>Flat</option></select>
          </div>
          <div className="field"><label>Discount Value</label><input type="number" required {...f("discountValue")} /></div>
          <div className="field"><label>Minimum Order (Rs.)</label><input type="number" {...f("minimumOrderAmount")} /></div>
          <div className="field"><label>Expiry Date</label><input type="date" required {...f("expiryDate")} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-gold" disabled={busy}>
              {busy ? "Saving…" : editing ? "Update Coupon" : "Create Coupon"}
            </button>
            {editing && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <table className="admin-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td><b>{c.code}</b></td>
                <td>{c.discountType}</td>
                <td>{c.discountType === "Percentage" ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}</td>
                <td>Rs. {c.minimumOrderAmount}</td>
                <td>{new Date(c.expiryDate).toLocaleDateString("en-IN")}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    className="icon-btn"
                    title="Edit"
                    aria-label="Edit"
                    onClick={() => startEdit(c)}
                  >
                    <Icon.Edit size={16} />
                  </button>
                  <button
                    className="icon-btn danger"
                    title="Delete"
                    aria-label="Delete"
                    onClick={() => remove(c._id)}
                  >
                    <Icon.Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan="6" style={{ color: "var(--muted)" }}>No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
