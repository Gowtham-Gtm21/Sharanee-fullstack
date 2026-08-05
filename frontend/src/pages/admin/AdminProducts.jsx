import { useEffect, useState } from "react";
import { productApi, categoryApi } from "../../api/endpoints";
import { imageUrl } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";
import { COLOR_OPTIONS } from "../../constants/colors";
const OCCASION_OPTIONS = [
  "Daily Wear",
  "Casual",
  "Office Wear",
  "Party Wear",
  "Wedding",
  "Festival",
  "Traditional",
];

const FABRIC_OPTIONS = [
  "Cotton",
  "Silk",
  "Kanchipuram Silk",
  "Soft Silk",
  "Art Silk",
  "Linen",
  "Georgette",
  "Chiffon",
  "Rayon",
  "Satin",
  "Poly Cotton",
];

const SIZE_OPTIONS = [
  "Free Size",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",

];

const PATTERN_OPTIONS = [
  "Plain",
  "Printed",
  "Floral",
  "Striped",
  "Checked",
  "Embroidered",
  "Woven",
  "Jacquard",
];

const EMPTY = {
  productName: "",
  description: "",
  category: "",
  price: "",
  discountPrice: "",
  stock: "",
  fabric: "",
  occasion: "",
  pattern: "",
  size: [],
  featured: false,

  colorVariants: [
    {
      colorName: "",
      colorCode: "",
      images: [],
      sizes: [],
    },
  ],
};
const MAX_IMAGES = 5;

export default function AdminProducts() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  // Existing image paths kept for the product being edited
  const [existingImages, setExistingImages] = useState([]);
  // Newly added image files (not yet uploaded)
  const [newFiles, setNewFiles] = useState([]);

  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const load = () =>
    productApi
      .list()
      .then((response) => {
        setProducts(response.data.products || []);
      })
      .catch(() => { });

  useEffect(() => {
    load();

    categoryApi
      .list()
      .then((response) => {
        setCats(response.data.categories || []);
      })
      .catch(() => { });
  }, []);

  const f = (key) => ({
    value: form[key],
    onChange: (event) =>
      setForm((currentForm) => ({
        ...currentForm,
        [key]: event.target.value,
      })),
  });

  const totalImageCount = existingImages.length + newFiles.length;

  const toggleSize = (size) => {
    setForm((currentForm) => {
      const current = Array.isArray(currentForm.size) ? currentForm.size : [];
      const next = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return { ...currentForm, size: next };
    });
  };

  const addColorVariant = () => {
    if (form.colorVariants.length >= 5) {
      toast.error("Maximum 5 color variants only allowed.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      colorVariants: [
        ...prev.colorVariants,
        {
          colorName: "",
          colorCode: "",
          images: [],
          sizes: [],
        },
      ],
    }));
  };

  const removeColorVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateColorVariant = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = [...prev.colorVariants];

      updated[index][field] = value;

      return {
        ...prev,
        colorVariants: updated,
      };
    });
  };
  const toggleVariantSize = (colorIndex, size) => {
    setForm((prev) => {
      const updated = prev.colorVariants.map((variant, index) => {
        if (index !== colorIndex) return variant;

        const currentSizes = Array.isArray(variant.sizes)
          ? variant.sizes
          : [];

        return {
          ...variant,
          sizes: currentSizes.includes(size)
            ? currentSizes.filter((s) => s !== size)
            : [...currentSizes, size],
        };
      });

      return {
        ...prev,
        colorVariants: updated,
      };
    });
  };
  const openNew = () => {
    setForm(EMPTY);
    setEditing(null);
    setExistingImages([]);
    setNewFiles([]);
    setOpen(true);
  };

  const openEdit = (product) => {
    setForm({
      productName: product.productName || "",
      description: product.description || "",
      category: product.category?._id || product.category || "",
      price: product.price ?? "",
      discountPrice: product.discountPrice ?? "",
      stock: product.stock ?? "",
      fabric: product.fabric || "",
      occasion: product.occasion || "",
      pattern: product.pattern || "",
      size: Array.isArray(product.size)
        ? product.size
        : product.size
          ? [product.size]
          : [],
      featured: Boolean(product.featured),

      colorVariants:
        product.colorVariants?.length > 0
          ? product.colorVariants.map((variant) => ({
            colorName: variant.colorName || "",
            colorCode: variant.colorCode || "#000000",
            images: variant.images || [],
            sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
          }))
          : [
            {
              colorName: "",
              colorCode: "",
              images: [],
              sizes: [],
            },
          ],
    });

    setEditing(product._id);
    setExistingImages(Array.isArray(product.images) ? product.images : []);
    setNewFiles([]);
    setOpen(true);
  };

  const addImages = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";

    if (picked.length === 0) return;

    setNewFiles((current) => {
      const combined = [...current, ...picked];
      const room = MAX_IMAGES - existingImages.length;

      if (combined.length > room) {
        toast.error(`Maximum ${MAX_IMAGES} images only allowed.`);
      }

      return combined.slice(0, Math.max(room, 0));
    });
  };

  const removeExistingImage = (imagePath) => {
    setExistingImages((current) =>
      current.filter((image) => image !== imagePath)
    );
  };

  const removeNewFile = (index) => {
    setNewFiles((current) => current.filter((_, i) => i !== index));
  };

  const save = async (event) => {
    event.preventDefault();
    const hasImages = form.colorVariants.some(
      (variant) => variant.images && variant.images.length > 0
    );

    if (!hasImages) {
      toast.error("Please upload at least one image for a color variant.");
      return;
    }

    if (!Array.isArray(form.size) || form.size.length === 0) {
      toast.error("Please select at least one size.");
      return;
    }

    setBusy(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {

        if (key === "size") {
          value.forEach((s) => formData.append("size", s));
        }

        else if (key === "colorVariants") {
          formData.append(
            "colorVariants",
            JSON.stringify(
              value.map((v) => ({
                colorName: v.colorName,
                colorCode: v.colorCode,
                sizes: v.sizes || [],
              }))
            )
          );
        } else if (key === "colorVariants") {
          formData.append(
            "colorVariants",
            JSON.stringify(
              value.map((v) => ({
                colorName: v.colorName,
                colorCode: v.colorCode,
                sizes: v.sizes || [],
              }))
            )
          );
        }
        else {
          formData.append(key, value);
        }

      });

      form.colorVariants.forEach((variant, index) => {
        variant.images.forEach((file) => {
          formData.append(`colorImages_${index}`, file);
        });
      });

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (editing) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }



      if (editing) {
        await productApi.update(editing, formData);
        toast.success("Product updated.");
      } else {
        await productApi.create(formData);
        toast.success("Product created.");
      }

      setOpen(false);
      setEditing(null);
      setForm(EMPTY);
      setExistingImages([]);
      setNewFiles([]);
      load();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not save product."
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await productApi.remove(id);
      toast.success("Product deleted.");
      load();
    } catch {
      toast.error("Could not delete.");
    }
  };
  // ================= FILTER + SORT + PAGINATION =================

  let filteredProducts = [...products];

  // Search
  if (search.trim()) {
    filteredProducts = filteredProducts.filter((product) =>
      product.productName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  // Category
  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category?.categoryName === categoryFilter
    );
  }

  // Stock
  if (stockFilter) {
    filteredProducts = filteredProducts.filter(
      (product) => product.stockStatus === stockFilter
    );
  }

  // Sort
  if (sortBy === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortBy === "name") {
    filteredProducts.sort((a, b) =>
      a.productName.localeCompare(b.productName)
    );
  }

  // Pagination
  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;

  const currentProducts = filteredProducts.slice(
    firstIndex,
    lastIndex
  );

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );
  return (
    <>
      <div className="admin-toolbar">

        <h1>Products</h1>

        <div className="product-toolbar products-toolbar">
          <div className="search-box">



            <input
              type="text"
              placeholder="Search Product..."
              className="toolbar-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

          </div>

          <select
            className="toolbar-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Category Filter</option>

            {cats.map((cat) => (
              <option
                key={cat._id}
                value={cat.categoryName}
              >
                {cat.categoryName}
              </option>
            ))}
          </select>

          <select
            className="toolbar-select"
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Stock Filter</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>


          <select
            className="toolbar-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort</option>
            <option value="low">Price Low → High</option>
            <option value="high">Price High → Low</option>
            <option value="name">Product Name</option>
          </select>

          <button
            className="btn btn-gold"
            onClick={openNew}
          >
            + Add Product
          </button>

        </div>

      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentProducts.map((product) => (
            <tr key={product._id}>
              <td>
                <img
                  src={
                    product.colorVariants?.[0]?.images?.[0]
                      ? imageUrl(product.colorVariants[0].images[0])
                      : "https://placehold.co/44x56/efe6d5/3f2317?text=S"
                  }
                  alt={product.productName || "Product"}
                />
              </td>

              <td>{product.productName}</td>

              <td>{product.category?.categoryName || "—"}</td>

              <td>
                Rs. {product.price?.toLocaleString("en-IN")}
              </td>

              <td>{product.stock}</td>

              <td>
                <span
                  className={`tag ${product.stockStatus === "In Stock"
                    ? "tag-green"
                    : product.stockStatus === "Low Stock"
                      ? "tag-orange"
                      : "tag-red"
                    }`}
                >
                  {product.stockStatus}
                </span>
              </td>

              <td style={{ whiteSpace: "nowrap" }}>
                <button
                  className="icon-btn"
                  title="Edit"
                  aria-label="Edit"
                  onClick={() => openEdit(product)}
                >
                  <Icon.Edit size={16} />
                </button>

                <button
                  className="icon-btn danger"
                  title="Delete"
                  aria-label="Delete"
                  onClick={() => remove(product._id)}
                >
                  <Icon.Trash size={16} />
                </button>
              </td>
            </tr>
          ))}

          {products.length === 0 && (
            <tr>
              <td
                colSpan="7"
                style={{ color: "var(--muted)" }}
              >
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => (
            <button
              key={index}
              className={
                currentPage === index + 1
                  ? "active-page"
                  : ""
              }
              onClick={() =>
                setCurrentPage(index + 1)
              }
            >
              {index + 1}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>

      </div>

      {open && (
        <div
          className="modal-back"
          onClick={(event) =>
            event.target === event.currentTarget && setOpen(false)
          }
        >
          <div className="modal">
            <h2>{editing ? "Edit" : "Add"} Product</h2>

            <form onSubmit={save}>
              <div className="field">
                <label>Product Name</label>
                <input required {...f("productName")} />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea rows="3" {...f("description")} />
              </div>

              <div className="form-2col">
                <div className="field">
                  <label>Category</label>

                  <select required {...f("category")}>
                    <option value="">Select category</option>

                    {cats.map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Occasion</label>

                  <select required {...f("occasion")}>
                    <option value="">Select occasion</option>

                    {OCCASION_OPTIONS.map((occasion) => (
                      <option key={occasion} value={occasion}>
                        {occasion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-2col">
                <div className="field">
                  <label>Price (Rs.)</label>

                  <input
                    type="number"
                    min="0"
                    required
                    {...f("price")}
                  />
                </div>

                <div className="field">
                  <label>Discount Price (Rs.)</label>

                  <input
                    type="number"
                    min="0"
                    {...f("discountPrice")}
                  />
                </div>
              </div>

              <div className="form-2col">
                <div className="field">
                  <label>Stock</label>

                  <input
                    type="number"
                    min="0"
                    required
                    {...f("stock")}
                  />
                </div>

                <div className="field">
                  <label>Fabric</label>

                  <select required {...f("fabric")}>
                    <option value="">Select fabric</option>

                    {FABRIC_OPTIONS.map((fabric) => (
                      <option key={fabric} value={fabric}>
                        {fabric}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <h3 className="section-title">Color Variants</h3>

              <div className="color-variants-wrapper">

                {form.colorVariants.map((variant, index) => (

                  <div className="color-card" key={index}>
                    <h4 className="color-card-title">
                      Color Variant {index + 1}
                    </h4>


                    <div className="field">
                      <label>Color Name</label>

                      <select
                        value={variant.colorName}
                        onChange={(e) => {
                          const selected = COLOR_OPTIONS.find(
                            (c) => c.name === e.target.value
                          );

                          updateColorVariant(index, "colorName", selected.name);
                          updateColorVariant(index, "colorCode", selected.code);
                        }}
                      >
                        <option value="">Select Color</option>

                        {COLOR_OPTIONS.map((color) => (
                          <option
                            key={color.name}
                            value={color.name}
                          >
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Available Sizes for {variant.colorName || `Color ${index + 1}`}
                      </label>

                      <div className="size-check-grid">
                        {SIZE_OPTIONS.map((size) => (
                          <label
                            className="size-check"
                            key={`${index}-${size}`}
                          >
                            <input
                              type="checkbox"
                              checked={(variant.sizes || []).includes(size)}
                              onChange={() => toggleVariantSize(index, size)}
                            />
                            {size}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="field">
                      <label>Upload Images (Maximum 5)</label>

                      <label className="upload-box">

                        <Icon.Plus size={28} />

                        <span>Click to Upload Images</span>

                        <small>Maximum 5 images</small>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);

                            const updated = [...form.colorVariants];

                            const currentImages = updated[index].images || [];

                            const mergedImages = [...currentImages, ...files];

                            if (mergedImages.length > 5) {
                              toast.error("You can upload up to 5 images for this color.");
                              e.target.value = "";
                              return;
                            }

                            updated[index] = {
                              ...updated[index],
                              images: mergedImages,
                            };

                            setForm((prev) => ({
                              ...prev,
                              colorVariants: updated,
                            }));

                            e.target.value = "";

                            setForm((prev) => ({
                              ...prev,
                              colorVariants: updated,
                            }));

                            e.target.value = "";
                          }}
                        />

                      </label>
                    </div>

                    {variant.images?.length > 0 && (
                      <div className="image-manager">
                        {variant.images.map((img, imageIndex) => {
                          const isFile = img instanceof File;

                          return (
                            <div
                              className="image-thumb"
                              key={`${index}-${imageIndex}`}
                            >
                              <img
                                src={
                                  isFile
                                    ? URL.createObjectURL(img)
                                    : imageUrl(img)
                                }
                                alt={`${variant.colorName} ${imageIndex + 1}`}
                              />

                              <button
                                type="button"
                                title="Remove image"
                                aria-label="Remove color image"
                                onClick={() => {
                                  const updated = [...form.colorVariants];

                                  updated[index] = {
                                    ...updated[index],
                                    images: updated[index].images.filter(
                                      (_, i) => i !== imageIndex
                                    ),
                                  };

                                  setForm((prev) => ({
                                    ...prev,
                                    colorVariants: updated,
                                  }));
                                }}
                              >
                                <Icon.Close size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeColorVariant(index)}
                    >
                      Remove Color
                    </button> */}
                    <button
                      type="button"
                      className="remove-color-btn"
                      onClick={() => removeColorVariant(index)}
                    >
                      <Icon.Trash size={16} />
                      Remove Color
                    </button>

                  </div>

                ))}

                <button
                  type="button"
                  className="btn btn-outline add-color-btn"
                  onClick={addColorVariant}
                >
                  + Add Color
                </button>

              </div>

              <div className="form-2col">

                <div className="field">
                  <label>Pattern</label>

                  <select required {...f("pattern")}>
                    <option value="">Select pattern</option>

                    {PATTERN_OPTIONS.map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {pattern}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="field">
                <label>Size</label>

                <div className="size-check-grid">
                  {SIZE_OPTIONS.map((size) => (
                    <label className="size-check" key={size}>
                      <input
                        type="checkbox"
                        checked={form.size.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>




              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  className="btn btn-gold"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save Product"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}