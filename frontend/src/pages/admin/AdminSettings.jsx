import { useEffect, useState } from "react";
import { settingApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../../components/Icons";
import "../../styles/AdminSettings.css";

const DEFAULTS = {
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "INR",

    shippingFee: 0,
    freeShippingThreshold: 0,
    deliveryDays: "5-7",

    taxRate: 0,
    taxIncluded: false,

    codEnabled: true,
    onlinePaymentEnabled: true,
    upiId: "",

    emailOnNewOrder: true,
    emailOnLowStock: true,
    emailOnNewCustomer: false,
    lowStockThreshold: 10,

    maintenanceMode: false,
};

const TABS = [
    { key: "general", label: "General" },
    { key: "shipping", label: "Shipping & Tax" },
    { key: "payment", label: "Payment" },
    { key: "notifications", label: "Notifications" },
];

export default function AdminSettings() {
    const toast = useToast();
    const [tab, setTab] = useState("general");
    const [form, setForm] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const res = await settingApi.get();
            setForm({ ...DEFAULTS, ...(res.data.settings || res.data || {}) });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const f = (k) => ({
        value: form[k],
        onChange: (e) => setForm({ ...form, [k]: e.target.value }),
    });

    const toggle = (k) => ({
        checked: !!form[k],
        onChange: (e) => setForm({ ...form, [k]: e.target.checked }),
    });

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingApi.update(form);
            toast.success("Settings saved.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="settings-loading">Loading Settings...</div>;
    }

    return (
        <div className="settings-page">
            <div className="admin-toolbar">
                <h1>Settings</h1>
            </div>
            <p className="settings-sub">
                Manage your store profile, shipping, payment and notification preferences.
            </p>

            <div className="settings-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        className={`btn ${tab === t.key ? "btn-gold" : "btn-outline"}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="settings-layout">
                <form onSubmit={save} className="settings-form">

                    {tab === "general" && (
                        <>
                            <div className="settings-grid">

                                <div className="order-card settings-card">
                                    <div className="card-header">
                                        <h3>🏪 Store Information</h3>
                                        <p>Basic details about your store.</p>
                                    </div>

                                    <div className="form-2col">
                                        <div className="field">
                                            <label>Store Name</label>
                                            <input
                                                required
                                                {...f("storeName")}
                                                placeholder="Sharanee"
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Currency</label>
                                            <select {...f("currency")}>
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card settings-card">
                                    <div className="card-header">
                                        <h3>📞 Contact Information</h3>
                                        <p>Customer support details.</p>
                                    </div>

                                    <div className="form-2col">
                                        <div className="field">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                required
                                                {...f("storeEmail")}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Phone</label>
                                            <input
                                                {...f("storePhone")}
                                            />
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label>Store Address</label>
                                        <textarea
                                            rows="4"
                                            {...f("storeAddress")}
                                        />
                                    </div>
                                </div>

                                <div className="order-card settings-card maintenance-card">

                                    <div className="maintenance-left">
                                        <h3>🛠 Maintenance Mode</h3>
                                        <p>
                                            Temporarily disable customer access while
                                            updating your store.
                                        </p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            {...toggle("maintenanceMode")}
                                        />
                                        <span className="slider"></span>
                                    </label>

                                </div>

                            </div>
                        </>
                    )}

                    {tab === "shipping" && (
                        <>
                            <div className="settings-grid">

                                <div className="order-card settings-card">

                                    <div className="card-header">
                                        <h3>🚚 Shipping Settings</h3>
                                        <p>Configure delivery charges.</p>
                                    </div>

                                    <div className="form-2col">

                                        <div className="field">
                                            <label>Shipping Fee (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...f("shippingFee")}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Free Shipping Above (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...f("freeShippingThreshold")}
                                            />
                                        </div>

                                    </div>

                                    <div className="field">
                                        <label>Estimated Delivery</label>
                                        <input
                                            {...f("deliveryDays")}
                                        />
                                    </div>

                                </div>

                                <div className="order-card settings-card">

                                    <div className="card-header">
                                        <h3>💰 Tax Settings</h3>
                                        <p>Manage GST and pricing.</p>
                                    </div>

                                    <div className="form-2col">

                                        <div className="field">
                                            <label>Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...f("taxRate")}
                                            />
                                        </div>

                                        <div className="field toggle-field">
                                            <label>Prices Include Tax</label>

                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    {...toggle("taxIncluded")}
                                                />
                                                <span className="slider"></span>
                                            </label>

                                        </div>

                                    </div>

                                </div>

                            </div>
                        </>
                    )}

                    {tab === "payment" && (
                        <div className="settings-grid">

                            <div className="order-card settings-card">

                                <div className="card-header">
                                    <h3>💳 Payment Methods</h3>
                                    <p>Choose how customers can pay.</p>
                                </div>

                                <div className="payment-option">

                                    <div className="payment-text">
                                        <h4>Cash on Delivery</h4>
                                        <p>Allow customers to pay after delivery.</p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            {...toggle("codEnabled")}
                                        />
                                        <span className="slider"></span>
                                    </label>

                                </div>

                                <div className="payment-option">

                                    <div className="payment-text">
                                        <h4>Online Payment</h4>
                                        <p>Accept Razorpay / UPI / Cards.</p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            {...toggle("onlinePaymentEnabled")}
                                        />
                                        <span className="slider"></span>
                                    </label>

                                </div>

                            </div>

                            <div className="order-card settings-card">

                                <div className="card-header">
                                    <h3>🏦 Payment Details</h3>
                                    <p>Configure payment information.</p>
                                </div>

                                <div className="field">
                                    <label>UPI ID</label>

                                    <input
                                        {...f("upiId")}
                                        placeholder="sharanee@upi"
                                    />
                                </div>

                            </div>

                        </div>
                    )}

                    {tab === "notifications" && (
                        <div className="settings-grid">

                            <div className="order-card settings-card">

                                <div className="card-header">
                                    <h3>🔔 Email Notifications</h3>
                                    <p>Choose which alerts the admin receives.</p>
                                </div>

                                <div className="payment-option">

                                    <div className="payment-text">
                                        <h4>New Order</h4>
                                        <p>Receive email when a customer places an order.</p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            {...toggle("emailOnNewOrder")}
                                        />
                                        <span className="slider"></span>
                                    </label>

                                </div>

                                <div className="payment-option">

                                    <div className="payment-text">
                                        <h4>Low Stock</h4>
                                        <p>Receive alerts for products running low.</p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            {...toggle("emailOnLowStock")}
                                        />
                                        <span className="slider"></span>
                                    </label>

                                </div>

                                <div className="payment-option">

                                    <div className="payment-text">
                                        <h4>New Customer</h4>
                                        <p>Receive alerts for new customer registrations.</p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            {...toggle("emailOnNewCustomer")}
                                        />
                                        <span className="slider"></span>
                                    </label>

                                </div>

                            </div>

                            <div className="order-card settings-card">

                                <div className="card-header">
                                    <h3>📦 Inventory Alert</h3>
                                    <p>Configure stock warning threshold.</p>
                                </div>

                                <div className="field">
                                    <label>Low Stock Threshold</label>

                                    <input
                                        type="number"
                                        min="0"
                                        {...f("lowStockThreshold")}
                                    />
                                </div>

                            </div>

                        </div>
                    )}

                    <div className="settings-actions">

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setForm(DEFAULTS)}
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            className="btn btn-gold"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                    </div>
                </form>


            </div>
        </div>
    );
}
