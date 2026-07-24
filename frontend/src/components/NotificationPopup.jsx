import { useEffect, useState } from "react";
import {
    FaBell,
    FaCheck,
    FaTrash,
    FaShoppingCart,
    FaBoxOpen,
    FaUsers,
    FaSearch
} from "react-icons/fa";
import { notificationApi } from "../api/endpoints";
import "./NotificationPopup.css";

export default function NotificationPopup({ onClose }) {

    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await notificationApi.list();
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error(err);
        }
    };

    const markRead = async (id) => {
        try {
            await notificationApi.markRead(id);

            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === id
                        ? { ...n, isRead: true }
                        : n
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationApi.remove(id);

            setNotifications((prev) =>
                prev.filter((n) => n._id !== id)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {

        await Promise.all(
            notifications.map((n) =>
                notificationApi.markRead(n._id)
            )
        );

        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                isRead: true
            }))
        );
    };

    const filtered = notifications.filter((n) => {

        if (filter === "read" && !n.isRead) return false;

        if (filter === "unread" && n.isRead) return false;

        return (
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.message.toLowerCase().includes(search.toLowerCase())
        );

    });

    const getIcon = (type) => {

        switch (type) {

            case "order":
                return <FaShoppingCart />;

            case "stock":
                return <FaBoxOpen />;

            case "customer":
                return <FaUsers />;

            default:
                return <FaBell />;
        }

    };

    return (

        <div className="notification-popup">

            <div className="popup-header">

                <h3>Notifications</h3>

                <div className="popup-header-actions">
                    <button
                        className="mark-all"
                        onClick={markAllRead}
                    >
                        Mark all as read
                    </button>

                    <button
                        className="popup-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

            </div>

            <div className="popup-search">

                <FaSearch />

                <input
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>

            <div className="popup-filter">

                <button
                    onClick={() => setFilter("all")}
                    className={filter === "all" ? "active" : ""}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("unread")}
                    className={filter === "unread" ? "active" : ""}
                >
                    Unread
                </button>

                <button
                    onClick={() => setFilter("read")}
                    className={filter === "read" ? "active" : ""}
                >
                    Read
                </button>

            </div>

            <div className="popup-list">

                {filtered.length === 0 && (

                    <div className="empty">

                        No Notifications

                    </div>

                )}

                {filtered.map((n) => (

                    <div
                        key={n._id}
                        className={`popup-card ${!n.isRead ? "unread" : ""}`}
                    >

                        <div className="popup-icon">

                            {getIcon(n.type)}

                        </div>

                        <div className="popup-body">

                            <h4>{n.title}</h4>

                            <p>{n.message}</p>

                            <small>
                                {new Date(n.createdAt).toLocaleString()}
                            </small>

                        </div>

                        <div className="popup-actions">

                            {!n.isRead && (

                                <button
                                    onClick={() =>
                                        markRead(n._id)
                                    }
                                >
                                    <FaCheck />
                                </button>

                            )}

                            <button
                                onClick={() =>
                                    deleteNotification(n._id)
                                }
                            >
                                <FaTrash />
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}