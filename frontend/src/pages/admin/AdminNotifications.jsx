import { useEffect, useState } from "react";
import { notificationApi } from "../../api/endpoints";
import { FaBell, FaTrash, FaCheck } from "react-icons/fa";

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.list();
            setNotifications(res.data.notifications);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleRead = async (id) => {
        try {
            await notificationApi.markRead(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notification?")) return;

        try {
            await notificationApi.remove(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <h2>Loading...</h2>;

    return (
        <div className="notification-page">

            <div className="notification-header">
                <FaBell />
                <h1>Admin Notifications</h1>
            </div>

            {notifications.length === 0 ? (
                <div className="empty-notification">
                    No Notifications Available
                </div>
            ) : (
                notifications.map((n) => (
                    <div
                        key={n._id}
                        className={`notification-card ${n.read ? "read" : "unread"}`}
                    >
                        <div className="notification-content">

                            <div className="notification-title">

                                <span className="notify-icon">
                                    {n.title.includes("Out") && "❌"}
                                    {n.title.includes("Low") && "⚠"}
                                    {n.title.includes("Order") && "🛒"}
                                    {n.title.includes("Customer") && "👤"}
                                </span>

                                <span>{n.title}</span>

                            </div>
                            <div className="notification-message">
                                {n.message}
                            </div>

                            <div className="notification-time">
                                {new Date(n.createdAt).toLocaleString()}
                            </div>

                        </div>

                        <div className="notification-actions">

                            {!n.read && (
                                <button
                                    className="read-btn"
                                    title="Mark as Read"
                                    onClick={() => handleRead(n._id)}
                                >
                                    <FaCheck />
                                </button>
                            )}

                            <button
                                className="delete-btn"
                                title="Delete Notification"
                                onClick={() => handleDelete(n._id)}
                            >
                                <FaTrash />
                            </button>

                        </div>
                    </div>
                ))
            )}

        </div>
    );
}