import { useEffect, useState } from "react";
import {
    discountApi,
    productApi,
    categoryApi,
} from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";
import "../../styles/Admin.css";

const EMPTY = {
    offerName: "",
    applyTo: "Product",
    product: "",
    category: "",
    discountType: "Percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
};

export default function AdminDiscounts() {
    const toast = useToast();

    const [discounts, setDiscounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState(EMPTY);

    const [editing, setEditing] = useState(null);

    const [busy, setBusy] = useState(false);

    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState("");

    const [applyFilter, setApplyFilter] = useState("");

    const [statusFilter, setStatusFilter] = useState("");

    const [sortBy, setSortBy] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 5;

    useEffect(() => {
        loadDiscounts();
        loadProducts();
        loadCategories();
    }, []);

    const loadDiscounts = async () => {
        try {
            const res = await discountApi.list();

            setDiscounts(res.data.discounts || []);
        } catch {
            toast.error("Could not load discounts.");
        }
    };

    const loadProducts = async () => {
        try {
            const res = await productApi.list();

            setProducts(res.data.products || []);
        } catch { }
    };

    const loadCategories = async () => {
        try {
            const res = await categoryApi.list();

            setCategories(res.data.categories || []);
        } catch { }
    };

    const f = (key) => ({
        value: form[key],
        onChange: (e) =>
            setForm({
                ...form,
                [key]: e.target.value,
            }),
    });

    const resetForm = () => {
        setForm(EMPTY);
        setEditing(null);
        setOpen(false);
    };

    let filtered = [...discounts];

    if (search.trim()) {
        filtered = filtered.filter((item) =>
            item.offerName
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );
    }

    if (applyFilter) {
        filtered = filtered.filter(
            (item) => item.applyTo === applyFilter
        );
    }

    if (statusFilter) {
        filtered = filtered.filter(
            (item) => item.status === statusFilter
        );
    }

    if (sortBy === "new") {
        filtered.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
    }

    if (sortBy === "old") {
        filtered.sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );
    }

    if (sortBy === "name") {
        filtered.sort((a, b) =>
            a.offerName.localeCompare(b.offerName)
        );
    }

    const lastIndex = currentPage * rowsPerPage;

    const firstIndex = lastIndex - rowsPerPage;

    const currentDiscounts = filtered.slice(
        firstIndex,
        lastIndex
    );

    const totalPages = Math.ceil(
        filtered.length / rowsPerPage
    );

    return (
        <>
            <div className="admin-toolbar">

                <h1>Discounts</h1>

                <div className="product-toolbar">

                    <div className="search-box">

                        <Icon.Search
                            size={18}
                            className="search-icon"
                        />

                        <input
                            type="text"
                            placeholder="Search Discount..."
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
                        value={applyFilter}
                        onChange={(e) => {
                            setApplyFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >

                        <option value="">
                            Apply To
                        </option>

                        <option value="Product">
                            Product
                        </option>

                        <option value="Category">
                            Category
                        </option>

                    </select>

                    <select
                        className="toolbar-select"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >

                        <option value="">
                            Status
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Scheduled">
                            Scheduled
                        </option>

                        <option value="Expired">
                            Expired
                        </option>

                    </select>

                    <select
                        className="toolbar-select"
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value)
                        }
                    >

                        <option value="">
                            Sort
                        </option>

                        <option value="new">
                            Newest
                        </option>

                        <option value="old">
                            Oldest
                        </option>

                        <option value="name">
                            Offer Name
                        </option>

                    </select>

                    <button
                        className="btn btn-gold"
                        onClick={() => {
                            resetForm();
                            setOpen(true);
                        }}
                    >
                        + ADD DISCOUNT
                    </button>

                </div>

            </div>

            <table className="admin-table">

                <thead>

                    <tr>

                        <th>Offer</th>

                        <th>Apply To</th>

                        <th>Discount</th>

                        <th>Start</th>

                        <th>End</th>

                        <th>Status</th>

                        <th>Actions</th>

                    </tr>

                </thead>

                <tbody>
                    {currentDiscounts.map((d) => (
                        <tr key={d._id}>

                            <td>
                                <b>{d.offerName}</b>
                            </td>

                            <td>
                                {d.applyTo === "Product"
                                    ? d.product?.productName || "-"
                                    : d.category?.categoryName || "-"}
                            </td>

                            <td>
                                {d.discountType === "Percentage"
                                    ? `${d.discountValue}%`
                                    : `₹${d.discountValue}`}
                            </td>

                            <td>
                                {new Date(d.startDate).toLocaleDateString("en-IN")}
                            </td>

                            <td>
                                {new Date(d.endDate).toLocaleDateString("en-IN")}
                            </td>

                            <td>

                                <span
                                    className={`coupon-status ${d.active
                                        ? d.status.toLowerCase()
                                        : "expired"
                                        }`}
                                >
                                    {d.active ? d.status : "Disabled"}
                                </span>

                            </td>

                            <td style={{ whiteSpace: "nowrap" }}>

                                <button
                                    className="icon-btn"
                                    title="Edit"
                                    onClick={() => {
                                        setEditing(d._id);

                                        setForm({
                                            offerName: d.offerName,
                                            applyTo: d.applyTo,
                                            product: d.product?._id || "",
                                            category: d.category?._id || "",
                                            discountType: d.discountType,
                                            discountValue: d.discountValue,
                                            startDate: d.startDate.slice(0, 10),
                                            endDate: d.endDate.slice(0, 10),
                                        });

                                        setOpen(true);
                                    }}
                                >
                                    <Icon.Edit size={16} />
                                </button>

                                <button
                                    className="icon-btn"
                                    title={d.active ? "Disable" : "Enable"}
                                    onClick={async () => {

                                        try {

                                            await discountApi.toggle(d._id);

                                            toast.success("Status updated");

                                            loadDiscounts();

                                        } catch {

                                            toast.error("Could not update.");

                                        }

                                    }}
                                >
                                    {d.active ? "🚫" : "✅"}
                                </button>

                                <button
                                    className="icon-btn danger"
                                    title="Delete"
                                    onClick={async () => {

                                        if (!confirm("Delete this discount?")) return;

                                        try {

                                            await discountApi.remove(d._id);

                                            toast.success("Discount deleted.");

                                            loadDiscounts();

                                        } catch {

                                            toast.error("Could not delete.");

                                        }

                                    }}
                                >
                                    <Icon.Trash size={16} />
                                </button>

                            </td>

                        </tr>
                    ))}

                    {currentDiscounts.length === 0 && (

                        <tr>

                            <td
                                colSpan="7"
                                style={{ color: "var(--muted)" }}
                            >

                                No Discounts Found.

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

                    (_, i) => (

                        <button

                            key={i}

                            className={
                                currentPage === i + 1
                                    ? "active-page"
                                    : ""
                            }

                            onClick={() => setCurrentPage(i + 1)}

                        >

                            {i + 1}

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
                    onClick={(e) =>
                        e.target === e.currentTarget && setOpen(false)
                    }
                >
                    <div className="modal">

                        <form
                            className="order-card"
                            onSubmit={async (e) => {

                                e.preventDefault();

                                if (form.applyTo === "Product" && !form.product) {
                                    return toast.error("Please select a product.");
                                }

                                if (form.applyTo === "Category" && !form.category) {
                                    return toast.error("Please select a category.");
                                }

                                const data = {
                                    ...form,
                                    product: form.applyTo === "Product" ? form.product : null,
                                    category: form.applyTo === "Category" ? form.category : null,
                                };

                                setBusy(true);

                                try {

                                    if (editing) {
                                        await discountApi.update(editing, data);
                                        toast.success("Discount updated.");
                                    } else {
                                        await discountApi.create(data);
                                        toast.success("Discount created.");
                                    }

                                    resetForm();
                                    loadDiscounts();

                                } catch (err) {

                                    toast.error(
                                        err.response?.data?.message || "Could not save."
                                    );

                                } finally {

                                    setBusy(false);

                                }
                            }}
                        >

                            <h2>
                                {editing
                                    ? "Edit"
                                    : "Add"}{" "}
                                Discount
                            </h2>

                            <div className="field">

                                <label>
                                    Offer Name
                                </label>

                                <input
                                    required
                                    {...f("offerName")}
                                    placeholder="Festival Offer"
                                />

                            </div>

                            <div className="field">

                                <label>
                                    Apply To
                                </label>

                                <select
                                    {...f("applyTo")}
                                >
                                    <option>
                                        Product
                                    </option>

                                    <option>
                                        Category
                                    </option>

                                </select>

                            </div>

                            {form.applyTo ===
                                "Product" ? (

                                <div className="field">

                                    <label>
                                        Product
                                    </label>

                                    <select
                                        {...f("product")}
                                    >

                                        <option value="">
                                            Select Product
                                        </option>

                                        {products.map(
                                            (p) => (
                                                <option
                                                    key={p._id}
                                                    value={p._id}
                                                >
                                                    {
                                                        p.productName
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            ) : (

                                <div className="field">

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        {...f("category")}
                                    >

                                        <option value="">
                                            Select Category
                                        </option>

                                        {categories.map(
                                            (c) => (
                                                <option
                                                    key={c._id}
                                                    value={c._id}
                                                >
                                                    {
                                                        c.categoryName
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            )}

                            <div className="form-2col">

                                <div className="field">

                                    <label>
                                        Discount Type
                                    </label>

                                    <select
                                        {...f(
                                            "discountType"
                                        )}
                                    >
                                        <option>
                                            Percentage
                                        </option>

                                        <option>
                                            Flat
                                        </option>

                                    </select>

                                </div>

                                <div className="field">

                                    <label>
                                        Value
                                    </label>

                                    <input
                                        type="number"
                                        required
                                        {...f(
                                            "discountValue"
                                        )}
                                    />

                                </div>

                            </div>

                            <div className="form-2col">

                                <div className="field">

                                    <label>
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        {...f(
                                            "startDate"
                                        )}
                                    />

                                </div>

                                <div className="field">

                                    <label>
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        {...f(
                                            "endDate"
                                        )}
                                    />

                                </div>

                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginTop: 18,
                                }}
                            >

                                <button
                                    className="btn btn-gold"
                                    disabled={busy}
                                >
                                    {busy
                                        ? "Saving..."
                                        : "Save Discount"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() =>
                                        setOpen(false)
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                </div >
            )
            }

        </>
    );

}