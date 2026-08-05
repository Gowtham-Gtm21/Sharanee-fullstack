import { useEffect, useMemo, useState } from "react";
import { reviewApi } from "../../api/endpoints";
import "../../styles/AdminReviews.css";
import {
    FaStar,
    FaEye,
    FaCheckCircle,
    FaEyeSlash,
    FaTrash,
    FaSearch,
} from "react-icons/fa";

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const loadReviews = async () => {
        try {
            setLoading(true);

            const { data } = await reviewApi.getAll();

            setReviews(data.reviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const stats = useMemo(() => {
        const total = reviews.length;

        const average =
            total === 0
                ? 0
                : (
                    reviews.reduce((sum, r) => sum + r.rating, 0) / total
                ).toFixed(1);

        const approved = reviews.filter(
            (r) => r.status === "Approved"
        ).length;

        const hidden = reviews.filter(
            (r) => r.status === "Hidden"
        ).length;

        return {
            total,
            average,
            approved,
            hidden,
        };
    }, [reviews]);

    const filteredReviews = reviews.filter((review) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            review.product?.productName
                ?.toLowerCase()
                .includes(keyword) ||
            review.user?.fullName
                ?.toLowerCase()
                .includes(keyword);

        const matchStatus =
            status === "All" || review.status === status;

        return matchSearch && matchStatus;
    });

    const changeStatus = async (id, value) => {
        try {
            await reviewApi.updateStatus(id, value);

            loadReviews();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm("Delete review?")) return;

        try {
            await reviewApi.remove(id);

            loadReviews();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="admin-reviews">

            <div className="page-header">
                <h2>Reviews & Ratings</h2>
            </div>

            {/* Dashboard Cards */}
            <div className="review-cards">

                <div className="review-card">
                    <FaStar className="card-icon gold" />
                    <div>
                        <h3>{stats.total}</h3>
                        <p>Total Reviews</p>
                    </div>
                </div>

                <div className="review-card">
                    <FaStar className="card-icon yellow" />
                    <div>
                        <h3>{stats.average}</h3>
                        <p>Average Rating</p>
                    </div>
                </div>

                <div className="review-card">
                    <FaCheckCircle className="card-icon green" />
                    <div>
                        <h3>{stats.approved}</h3>
                        <p>Approved</p>
                    </div>
                </div>

                <div className="review-card">
                    <FaEyeSlash className="card-icon red" />
                    <div>
                        <h3>{stats.hidden}</h3>
                        <p>Hidden</p>
                    </div>
                </div>

            </div>
            <div className="review-toolbar">

                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by product or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="All">All Reviews</option>
                    <option value="Approved">Approved</option>
                    <option value="Hidden">Hidden</option>
                    <option value="Pending">Pending</option>
                </select>

            </div>
            {loading ? (
                <div className="loading">
                    Loading Reviews...
                </div>
            ) : (

                <div className="reviews-table">

                    <table>

                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Customer</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        No Reviews Found
                                    </td>
                                </tr>
                            ) : (

                                filteredReviews.map((review) => (

                                    <tr key={review._id}>

                                        <td>
                                            {review.product?.productName}
                                        </td>

                                        <td>
                                            {review.user?.fullName}
                                        </td>

                                        <td>

                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={
                                                        star <= review.rating
                                                            ? "star active"
                                                            : "star"
                                                    }
                                                />
                                            ))}

                                        </td>

                                        <td className="review-text">
                                            {review.review}
                                        </td>

                                        <td>

                                            <span
                                                className={`status ${review.status.toLowerCase()}`}
                                            >
                                                {review.status}
                                            </span>

                                        </td>

                                        <td>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="actions">

                                            <button
                                                type="button"
                                                className="review-action-btn approve"
                                                onClick={() =>
                                                    changeStatus(review._id, "Approved")
                                                }
                                            >
                                                <FaCheckCircle />
                                            </button>

                                            <button
                                                type="button"
                                                className="review-action-btn hide"
                                                onClick={() =>
                                                    changeStatus(review._id, "Hidden")
                                                }
                                            >
                                                <FaEyeSlash />
                                            </button>

                                            <button
                                                type="button"
                                                className="review-action-btn delete"
                                                onClick={() =>
                                                    deleteReview(review._id)
                                                }
                                            >
                                                <FaTrash />
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>
            )}
        </div>
    );
}