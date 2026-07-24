import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { adminApi } from "../../api/endpoints";

export default function SearchResults() {
    const [params] = useSearchParams();

    const query = params.get("q") || "";

    const [results, setResults] = useState({
        products: [],
        categories: [],
        users: [],
        orders: [],
        coupons: [],
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) return;

        adminApi
            .search(query)
            .then((res) => {
                setResults(res.data);
            })
            .finally(() => setLoading(false));
    }, [query]);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="search-page">

            <h1>Search Results</h1>

            <p>
                Showing results for <b>"{query}"</b>
            </p>

            {/* Products */}

            <section className="search-section">

                <h2>Products ({results.products.length})</h2>

                {results.products.length ? (
                    results.products.map((p) => (
                        <div className="search-card" key={p._id}>
                            <Link to={`/admin/products`}>
                                <h3>{p.productName}</h3>

                                <p>{p.brand}</p>

                                <p>₹ {p.price}</p>

                                <p>{p.category?.categoryName}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No Products Found</p>
                )}

            </section>

            {/* Categories */}

            <section className="search-section">

                <h2>Categories ({results.categories.length})</h2>

                {results.categories.length ? (
                    results.categories.map((c) => (
                        <div className="search-card" key={c._id}>
                            <Link to="/admin/categories">
                                <h3>{c.categoryName}</h3>

                                <p>{c.description}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No Categories Found</p>
                )}

            </section>

            {/* Customers */}

            <section className="search-section">

                <h2>Customers ({results.users.length})</h2>

                {results.users.length ? (
                    results.users.map((u) => (
                        <div className="search-card" key={u._id}>
                            <Link to="/admin/users">
                                <h3>{u.fullName}</h3>

                                <p>{u.email}</p>

                                <p>{u.phone}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No Customers Found</p>
                )}

            </section>

            {/* Orders */}

            <section className="search-section">

                <h2>Orders ({results.orders.length})</h2>

                {results.orders.length ? (
                    results.orders.map((o) => (
                        <div className="search-card" key={o._id}>
                            <Link to="/admin/orders">
                                <h3>{o.user?.fullName}</h3>

                                <p>Status : {o.orderStatus}</p>

                                <p>Tracking : {o.trackingId || "-"}</p>

                                <p>₹ {o.totalAmount}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No Orders Found</p>
                )}

            </section>

            {/* Coupons */}

            <section className="search-section">

                <h2>Coupons ({results.coupons.length})</h2>

                {results.coupons.length ? (
                    results.coupons.map((c) => (
                        <div className="search-card" key={c._id}>
                            <Link to="/admin/coupons">
                                <h3>{c.code}</h3>

                                <p>{c.discountType}</p>

                                <p>{c.discountValue}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No Coupons Found</p>
                )}

            </section>

        </div>
    );
}