import { useEffect, useState } from "react";
import { categoryApi } from "../../api/endpoints";
import { imageUrl } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";

const EMPTY = { categoryName: "", description: "" };

export default function AdminCategories() {
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => categoryApi.list().then((r) => setCats(r.data.categories || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const resetForm = () => {
    setForm(EMPTY);
    setImageFile(null);
    setEditing(null);
  };

  const startEdit = (category) => {
    setEditing(category._id);
    setForm({
      categoryName: category.categoryName || "",
      description: category.description || "",
    });
    setImageFile(null);
  };

  const save = async (e) => {
    e.preventDefault();

    if (!editing && !imageFile) {
      toast.error("Please choose a category image.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("categoryName", form.categoryName);
      formData.append("description", form.description);
      if (imageFile) {
        formData.append("categoryImage", imageFile);
      }

      if (editing) {
        await categoryApi.update(editing, formData);
        toast.success("Category updated.");
      } else {
        await categoryApi.create(formData);
        toast.success("Category added.");
      }

      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save category.");
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryApi.remove(id);
      toast.success("Category deleted.");
      if (editing === id) resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete category.");
    }
  };

  return (
    <>
      <h1>Categories</h1>
      <div className="admin-cat">
        <form onSubmit={save} className="order-card">
          <h3 style={{ fontSize: "1.3rem" }}>{editing ? "Edit Category" : "Add Category"}</h3>
          <div className="field"><label>Name</label><input required {...f("categoryName")} /></div>
          <div className="field">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {editing && (
              <small style={{ color: "var(--muted)" }}>
                Leave empty to keep the existing image.
              </small>
            )}
          </div>
          <div className="field"><label>Description</label><textarea rows="2" {...f("description")} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-gold" disabled={busy}>
              {busy ? "Saving…" : editing ? "Update Category" : "Add Category"}
            </button>
            {editing && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Description</th><th></th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c._id}>
                <td><img src={c.categoryImage ? imageUrl(c.categoryImage) : "https://placehold.co/44x56/efe6d5/3f2317?text=S"} alt="" /></td>
                <td>{c.categoryName}</td>
                <td style={{ color: "var(--muted)" }}>{c.description || "—"}</td>
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
            {cats.length === 0 && <tr><td colSpan="4" style={{ color: "var(--muted)" }}>No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
