import { useEffect, useState } from "react";
import { categoryApi } from "../../api/endpoints";
import { imageUrl } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";

const EMPTY = { categoryName: "", description: "" };
const MAX_IMAGES = 5;

export default function AdminCategories() {
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const CATEGORY_PER_PAGE = 5;

  const load = () => categoryApi.list().then((r) => setCats(r.data.categories || [])).catch(() => { });
  useEffect(() => { load(); }, []);

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const resetForm = () => {
    setForm(EMPTY);
    setExistingImages([]);
    setNewFiles([]);
    setEditing(null);
  };

  const startEdit = (category) => {
    setEditing(category._id);
    setForm({
      categoryName: category.categoryName || "",
      description: category.description || "",
    });
    setExistingImages(category.categoryImages || []);
    setNewFiles([]);
  };


  const save = async (e) => {
    e.preventDefault();

    if (!editing && existingImages.length + newFiles.length === 0) {
      toast.error("Please choose a category image.");
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("categoryName", form.categoryName);
      formData.append("description", form.description);
      if (editing) {
        formData.append(
          "existingImages",
          JSON.stringify(existingImages)
        );
      }

      newFiles.forEach((file) => {
        formData.append("categoryImages", file);
      });

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

  let filteredCategories = [...cats];

  if (search.trim()) {
    filteredCategories = filteredCategories.filter(
      (c) =>
        c.categoryName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        c.description
          ?.toLowerCase()
          .includes(search.toLowerCase())
    );
  }

  const lastIndex = currentPage * CATEGORY_PER_PAGE;
  const firstIndex = lastIndex - CATEGORY_PER_PAGE;

  const currentCategories =
    filteredCategories.slice(firstIndex, lastIndex);

  const totalPages = Math.ceil(
    filteredCategories.length / CATEGORY_PER_PAGE
  );

  return (
    <>
      <div className="admin-toolbar">

        <h1>Categories</h1>

        <input
          className="toolbar-input"
          placeholder="Search Categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

      </div>
      <div className="admin-cat">
        <form onSubmit={save} className="order-card">
          <h3 style={{ fontSize: "1.3rem" }}>{editing ? "Edit Category" : "Add Category"}</h3>
          <div className="field"><label>Name</label><input required {...f("categoryName")} /></div>
          <div className="field">
            <label>Images (Up to 5)</label>

            <label className="upload-btn">
              + Add Images

              <input
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  setNewFiles((prev) =>
                    [...prev, ...files].slice(0, 5)
                  );
                }}
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 15,
              }}
            >
              {existingImages.map((img, index) => (
                <div
                  key={`old-${index}`}
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
                  }}
                >
                  <img
                    src={imageUrl(img)}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setExistingImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "none",
                      background: "#dc2626",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {newFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setNewFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "none",
                      background: "#dc2626",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
          <thead>
            <tr>
              <th style={{ width: "240px" }}>Image</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.map((c) => (
              <tr key={c._id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {c.categoryImages?.length > 0 && (
                      <img
                        src={imageUrl(c.categoryImages[0])}
                        alt=""
                        width={70}
                        height={70}
                        style={{
                          objectFit: "cover",
                          borderRadius: 12,
                        }}
                      />
                    )}

                    {c.categoryImages?.length > 1 && (
                      <span
                        style={{
                          background: "#f3f4f6",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        +{c.categoryImages.length - 1}
                      </span>
                    )}
                  </div>
                </td>
                <td>{c.categoryName}</td>
                <td style={{ color: "var(--muted)" }}>
                  {(c.description || "—").replace(
                    /\s*by\s+Sharanee/i,
                    ""
                  )}
                </td>
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
            {currentCategories.length === 0 && <tr><td colSpan="4" style={{ color: "var(--muted)" }}>No categories yet.</td></tr>}
          </tbody>
        </table>


        <div className="pagination">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
          >

            Previous

          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i}
                className={
                  currentPage === i + 1
                    ?
                    "active-page"
                    :
                    ""
                }
                onClick={() =>
                  setCurrentPage(i + 1)
                }
              >

                {i + 1}

              </button>
            )
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
          >

            Next

          </button>

        </div>
      </div>
    </>
  );
}
