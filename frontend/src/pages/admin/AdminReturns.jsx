import { useEffect, useState } from "react";
import { returnApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import "../../styles/AdminReturns.css";
export default function AdminReturns() {
    const toast = useToast();

    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [updating, setUpdating] = useState(false);

    const loadReturns = async () => {
        try {
            setLoading(true);

            const response = await returnApi.getAll();

            setReturns(response.data.returns || []);
        } catch (error) {
            console.error("Admin returns error:", error);

            toast.error(
                error.response?.data?.message ||
                "Could not load return requests."
            );

            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReturns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateReturn = async (status) => {
        if (!selectedReturn) return;

        try {
            setUpdating(true);

            const data = {
                status,
            };

            if (status === "Approved") {
                data.adminNote = "Return request approved";
            }

            if (status === "Rejected") {
                data.adminNote = "Return request rejected";
            }

            if (status === "Picked Up") {
                data.adminNote = "Returned product picked up";
                data.refundStatus = "Processing";
            }

            if (status === "Refunded") {
                data.adminNote = "Refund completed";
                data.refundStatus = "Completed";

                data.refundAmount =
                    selectedReturn.product?.discountPrice ||
                    selectedReturn.product?.price ||
                    0;
            }

            await returnApi.updateStatus(
                selectedReturn._id,
                data
            );

            toast.success(`Return updated to ${status}.`);

            setSelectedReturn(null);

            await loadReturns();

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Could not update return."
            );
        } finally {
            setUpdating(false);
        }
    };


    if (loading) {
        return <div className="spinner" />;
    }

    return (
        <div className="admin-returns-page">

            <div className="admin-returns-header">
                <div>
                    <h1>Returns & Refunds</h1>
                    <p>
                        Manage customer return requests and refund processing.
                    </p>
                </div>
            </div>

            <div className="admin-returns-summary">

                <div className="return-summary-card">
                    <div className="return-card-icon">↩</div>
                    <span>TOTAL REQUESTS</span>
                    <strong>{returns.length}</strong>
                    <small>All Return Requests</small>
                </div>

                <div className="return-summary-card">
                    <div className="return-card-icon">⏳</div>
                    <span>REQUESTED</span>
                    <strong>
                        {returns.filter((item) => item.status === "Requested").length}
                    </strong>
                    <small>Pending Requests</small>
                </div>

                <div className="return-summary-card">
                    <div className="return-card-icon">✓</div>
                    <span>APPROVED</span>
                    <strong>
                        {returns.filter((item) => item.status === "Approved").length}
                    </strong>
                    <small>Approved Returns</small>
                </div>

                <div className="return-summary-card">
                    <div className="return-card-icon">₹</div>
                    <span>REFUNDED</span>
                    <strong>
                        {returns.filter((item) => item.status === "Refunded").length}
                    </strong>
                    <small>Completed Refunds</small>
                </div>

            </div>

            {returns.length === 0 ? (
                <div className="admin-returns-empty">
                    No return requests found.
                </div>
            ) : (
                <div className="admin-returns-table-wrap">
                    <table className="admin-returns-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Reason</th>
                                <th>Return Status</th>
                                <th>Refund Status</th>
                                <th>Amount</th>
                                <th>Requested</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {returns.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <strong>
                                            {item.user?.fullName || "—"}
                                        </strong>

                                        <small>
                                            {item.user?.email || ""}
                                        </small>
                                    </td>

                                    <td>
                                        {item.product?.productName || "—"}
                                    </td>

                                    <td>
                                        {item.reason || "—"}
                                    </td>

                                    <td>
                                        <span className="return-status">
                                            {item.status}
                                        </span>
                                    </td>

                                    <td>
                                        {item.refundStatus || "Not Started"}
                                    </td>

                                    <td>
                                        ₹{Number(
                                            item.refundAmount || 0
                                        ).toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString(
                                                "en-IN"
                                            )
                                            : "—"}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() => setSelectedReturn(item)}
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedReturn && (
                <div className="return-admin-modal-overlay">
                    <div className="return-admin-modal">

                        <div className="return-admin-modal-head">
                            <div>
                                <h2>Manage Return</h2>
                                <p>{selectedReturn.product?.productName}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedReturn(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="return-admin-info">
                            <p>
                                <strong>Customer:</strong>{" "}
                                {selectedReturn.user?.fullName || "—"}
                            </p>

                            <p>
                                <strong>Reason:</strong>{" "}
                                {selectedReturn.reason}
                            </p>

                            <p>
                                <strong>Return Status:</strong>{" "}
                                {selectedReturn.status}
                            </p>

                            <p>
                                <strong>Refund Status:</strong>{" "}
                                {selectedReturn.refundStatus || "Not Started"}
                            </p>
                        </div>

                        <div className="return-admin-actions">

                            {selectedReturn.status === "Requested" && (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-gold"
                                        disabled={updating}
                                        onClick={() => updateReturn("Approved")}
                                    >
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        disabled={updating}
                                        onClick={() => updateReturn("Rejected")}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {selectedReturn.status === "Approved" && (
                                <button
                                    type="button"
                                    className="btn btn-gold"
                                    disabled={updating}
                                    onClick={() => updateReturn("Picked Up")}
                                >
                                    Mark Picked Up
                                </button>
                            )}

                            {selectedReturn.status === "Picked Up" && (
                                <button
                                    type="button"
                                    className="btn btn-gold"
                                    disabled={updating}
                                    onClick={() => updateReturn("Refunded")}
                                >
                                    Complete Refund
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}