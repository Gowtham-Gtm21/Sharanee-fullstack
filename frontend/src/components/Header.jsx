import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { categoryApi } from "../api/endpoints";
import SearchOverlay from "./SearchOverlay";

export default function Header() {
    const { user, logout, isAdmin } = useAuth();
    const { cartCount, cartTotal, wishlist } = useCart();

    const [drawer, setDrawer] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [cats, setCats] = useState([]);
    const [shopOpen, setShopOpen] = useState(false);
    const [acctOpen, setAcctOpen] = useState(false);

    const acctRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        categoryApi
            .list()
            .then((r) => setCats(r.data.categories || []))
            .catch(() => { });
    }, []);

    // Close account menu on outside click
    useEffect(() => {
        const h = (e) => {
            if (
                acctRef.current &&
                !acctRef.current.contains(e.target)
            ) {
                setAcctOpen(false);
            }
        };

        document.addEventListener("mousedown", h);

        return () => {
            document.removeEventListener("mousedown", h);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setAcctOpen(false);
        setDrawer(false);
        navigate("/");
    };

    return (
        <>
            {/* Top utility bar */}
            <div className="topbar">
                <div className="container">
                    <div className="topbar-left">
                        <span>
                            <Icon.Phone /> (307) 555-0133
                        </span>

                        <span>
                            <Icon.Mail /> designer@sharanee.com
                        </span>
                    </div>

                    <div className="topbar-mid">
                        New Arrivals Just Dropped —{" "}
                        <Link to="/shop">Shop Now</Link>
                    </div>

                    <div className="topbar-right">
                        INR · English
                    </div>
                </div>
            </div>

            {/* Announcement marquee */}
            <div className="announce">
                <div className="announce-track">
                    {[...Array(2)].map((_, k) => (
                        <span key={k} style={{ display: "inline" }}>
                            <span>
                                Saree Inskirt Crafted for Every Celebration
                            </span>
                            <span>
                                Timeless Designs Rooted in Tradition
                            </span>
                            <span>Handcrafted Elegance</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Main header */}
            <header className="header">
                <div className="container">
                    <button
                        className="burger"
                        onClick={() => setDrawer(true)}
                        aria-label="Menu"
                    >
                        <Icon.Menu />
                    </button>

                    <nav className="nav">
                        <NavLink to="/" end>
                            Home
                        </NavLink>

                        <div
                            className="nav-item"
                            onMouseEnter={() => setShopOpen(true)}
                            onMouseLeave={() => setShopOpen(false)}
                        >
                            <NavLink to="/shop" className="nav-drop">
                                Shop <Icon.Chevron size={14} />
                            </NavLink>

                            {shopOpen && (
                                <div className="mega">
                                    <div className="mega-col">
                                        <span className="mega-head">
                                            Categories
                                        </span>

                                        <Link to="/shop">
                                            All Products
                                        </Link>

                                        {cats.map((c) => (
                                            <Link
                                                key={c._id}
                                                to={`/shop?category=${c._id}`}
                                            >
                                                {c.categoryName}
                                            </Link>
                                        ))}

                                        {cats.length === 0 && (
                                            <>
                                                <Link to="/shop?search=Saree">
                                                    Saree Inskirt
                                                </Link>

                                                <Link to="/shop?search=Designer Sarees">
                                                    Designer Sarees
                                                </Link>

                                                <Link to="/shop?search=Gown">
                                                    Traditional Gown
                                                </Link>

                                                <Link to="/shop?search=Indo">
                                                    Indo Western
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    <div className="mega-col">
                                        <span className="mega-head">
                                            Shop By
                                        </span>

                                        <Link to="/shop?sort=newest">
                                            New Arrivals
                                        </Link>

                                        <Link to="/shop?featured=true">
                                            Featured
                                        </Link>

                                        <Link to="/shop?sort=low">
                                            Best Value
                                        </Link>

                                        <Link to="/shop">
                                            On Sale
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <NavLink to="/blog">Blog</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/contact">Contact</NavLink>

                        {isAdmin && (
                            <NavLink to="/admin">
                                Admin
                            </NavLink>
                        )}
                    </nav>

                    <Link to="/" className="brand">
                        <img src="/logo.png" alt="Sharanee" />
                    </Link>

                    <div className="header-icons">
                        <button
                            onClick={() => setShowSearch(true)}
                            aria-label="Search"
                        >
                            <Icon.Search />
                        </button>

                        {/* Wishlist icon — customer only */}
                        {!isAdmin && (
                            <Link
                                to="/wishlist"
                                className="ic-btn"
                                aria-label="Wishlist"
                            >
                                <Icon.Wishlist />

                                {wishlist.length > 0 && (
                                    <span className="icon-count">
                                        {wishlist.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        <div className="acct" ref={acctRef}>
                            <button
                                onClick={() => setAcctOpen((o) => !o)}
                                aria-label="Account"
                            >
                                <Icon.User />
                            </button>

                            {acctOpen && (
                                <div className="acct-menu">
                                    {user ? (
                                        <>
                                            <div className="acct-hi">
                                                Hi,{" "}
                                                {user.fullName
                                                    ? user.fullName.split(" ")[0]
                                                    : "Sharanee"}
                                            </div>

                                            <Link
                                                to="/account"
                                                onClick={() => setAcctOpen(false)}
                                            >
                                                My Account
                                            </Link>

                                            {/* Orders and wishlist — customer only */}
                                            {!isAdmin && (
                                                <>
                                                    <Link
                                                        to="/orders"
                                                        onClick={() => setAcctOpen(false)}
                                                    >
                                                        My Orders
                                                    </Link>

                                                    <Link
                                                        to="/wishlist"
                                                        onClick={() => setAcctOpen(false)}
                                                    >
                                                        Wishlist
                                                    </Link>
                                                </>
                                            )}

                                            {/* Admin Panel — admin only */}
                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setAcctOpen(false)}
                                                >
                                                    Admin Panel
                                                </Link>
                                            )}

                                            <button
                                                className="acct-out"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="acct-hi">
                                                Welcome to Sharanee
                                            </div>

                                            <Link
                                                to="/login"
                                                className="btn btn-gold btn-block"
                                                onClick={() => setAcctOpen(false)}
                                            >
                                                Sign In
                                            </Link>

                                            <Link
                                                to="/register"
                                                className="acct-reg"
                                                onClick={() => setAcctOpen(false)}
                                            >
                                                Create an account
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart — customer only */}
                        {!isAdmin && (
                            <Link
                                to="/cart"
                                className="header-cart"
                                aria-label="Cart"
                            >
                                <span className="ic-btn">
                                    <Icon.Cart />

                                    {cartCount > 0 && (
                                        <span className="icon-count">
                                            {cartCount}
                                        </span>
                                    )}
                                </span>

                                <span className="cart-txt">
                                    <small>My Cart</small>

                                    <b>
                                        Rs. {cartTotal.toLocaleString("en-IN")}
                                    </b>
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Centered search overlay */}
            {showSearch && (
                <SearchOverlay
                    onClose={() => setShowSearch(false)}
                />
            )}

            {/* Mobile drawer */}
            {drawer && (
                <>
                    <div
                        className="drawer-back"
                        onClick={() => setDrawer(false)}
                    />

                    <div className="drawer">
                        <button
                            className="drawer-close"
                            onClick={() => setDrawer(false)}
                        >
                            <Icon.Close />
                        </button>

                        <Link
                            to="/"
                            onClick={() => setDrawer(false)}
                        >
                            Home
                        </Link>

                        <Link
                            to="/shop"
                            onClick={() => setDrawer(false)}
                        >
                            Shop
                        </Link>

                        <Link
                            to="/blog"
                            onClick={() => setDrawer(false)}
                        >
                            Blog
                        </Link>

                        <Link
                            to="/about"
                            onClick={() => setDrawer(false)}
                        >
                            About
                        </Link>

                        <Link
                            to="/contact"
                            onClick={() => setDrawer(false)}
                        >
                            Contact
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/account"
                                    onClick={() => setDrawer(false)}
                                >
                                    My Account
                                </Link>

                                {/* Customer only */}
                                {!isAdmin && (
                                    <>
                                        <Link
                                            to="/orders"
                                            onClick={() => setDrawer(false)}
                                        >
                                            My Orders
                                        </Link>

                                        <Link
                                            to="/wishlist"
                                            onClick={() => setDrawer(false)}
                                        >
                                            Wishlist
                                        </Link>
                                    </>
                                )}

                                {/* Admin only */}
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setDrawer(false)}
                                    >
                                        Admin Panel
                                    </Link>
                                )}

                                <a onClick={handleLogout}>
                                    Logout
                                </a>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/wishlist"
                                    onClick={() => setDrawer(false)}
                                >
                                    Wishlist
                                </Link>

                                <Link
                                    to="/login"
                                    onClick={() => setDrawer(false)}
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    onClick={() => setDrawer(false)}
                                >
                                    Create Account
                                </Link>
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}