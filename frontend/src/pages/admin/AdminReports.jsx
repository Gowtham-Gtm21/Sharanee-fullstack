import { useEffect, useState } from "react";
import "../../styles/AdminReports.css";

import {
    FaRupeeSign,
    FaShoppingCart,
    FaBoxOpen,
    FaTags,
    FaUsers,

    FaArrowRight,
} from "react-icons/fa";

import { reportApi } from "../../api/endpoints";

const AdminReports = () => {
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        categories: 0,
        customers: 0,
    });

    const [revenueSummary, setRevenueSummary] = useState({});
    const [monthlySales, setMonthlySales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topCategories, setTopCategories] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const res = await reportApi.dashboard();

            setStats({
                revenue: res.data.summary?.totalRevenue || 0,
                orders: res.data.summary?.totalOrders || 0,
                products: res.data.summary?.totalProducts || 0,
                categories: res.data.summary?.totalCategories || 0,
                customers: res.data.summary?.totalCustomers || 0,
            });


            setRevenueSummary(res.data.revenueSummary || {});
            setMonthlySales(res.data.monthlySales || []);
            setTopProducts(res.data.topProducts || []);
            setTopCategories(res.data.topCategories || []);
            console.log(res.data.recentOrders);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="reports-loading">
                Loading Reports...
            </div>
        );
    }



    return (

        <div className="reports-page">

            <div className="reports-header">

                <div>

                    <h1>Reports Dashboard</h1>

                    <p>
                        Track your store performance and key insights.
                    </p>

                </div>


            </div>

            <div className="stat-grid">

                <div className="stat">
                    <FaRupeeSign className="stat-icon" />

                    <div className="l">Revenue</div>

                    <div className="n">
                        ₹ {(stats.revenue ?? 0).toLocaleString("en-IN")}
                    </div>

                    <div className="d">Total Revenue</div>
                </div>

                <div className="stat">
                    <FaShoppingCart className="stat-icon" />

                    <div className="l">Orders</div>

                    <div className="n">
                        {stats.orders}
                    </div>

                    <div className="d">Orders Received</div>
                </div>


                <div className="stat">
                    <FaBoxOpen className="stat-icon" />

                    <div className="l">Products</div>

                    <div className="n">
                        {stats.products}
                    </div>

                    <div className="d">Active Products</div>
                </div>


                <div className="stat">
                    <FaTags className="stat-icon" />

                    <div className="l">Categories</div>

                    <div className="n">
                        {stats.categories}
                    </div>

                    <div className="d">Available Categories</div>
                </div>

                <div className="stat">
                    <FaUsers className="stat-icon" />

                    <div className="l">Customers</div>

                    <div className="n">
                        {stats.customers}
                    </div>

                    <div className="d">Registered Customers</div>
                </div>

            </div> {/* stat-grid */}

            <div className="reports-content">

                <div className="report-table-card">

                    <div className="table-header">

                        <div className="table-title">

                            <FaRupeeSign />

                            <h3>Revenue Summary</h3>

                        </div>

                    </div>

                    <div className="report-list">
                        <p><strong>Total Revenue:</strong> ₹ {Number(revenueSummary.totalRevenue || 0).toLocaleString("en-IN")}</p>
                        <p><strong>Average Order:</strong> ₹ {Number(revenueSummary.averageOrderValue || 0).toFixed(2)}</p>
                        <p><strong>Total Sales:</strong> {revenueSummary.totalSales || 0}</p>
                    </div>
                </div>



                <div className="report-table-card">

                    <div className="table-header">

                        <div className="table-title">

                            <FaShoppingCart />

                            <h3>Monthly Sales</h3>

                        </div>

                    </div>

                    <div className="report-list">
                        {monthlySales.length ? (
                            monthlySales.map((item) => (
                                <div key={`${item._id.year}-${item._id.month}`}>
                                    {item._id.month}/{item._id.year} — ₹ {item.revenue.toLocaleString("en-IN")} ({item.orders} Orders)
                                </div>
                            ))
                        ) : (
                            <p>No monthly sales found.</p>
                        )}
                    </div>

                </div>



                <div className="report-table-card">

                    <div className="table-header">

                        <div className="table-title">

                            <FaBoxOpen />

                            <h3>Top Selling Products</h3>

                        </div>

                    </div>

                    <div className="report-list">
                        {topProducts.length ? (
                            topProducts.map((item) => (
                                <div key={item._id}>
                                    {item.productName} - {item.quantitySold} Sold
                                </div>
                            ))
                        ) : (
                            <p>No product sales found.</p>
                        )}
                    </div>

                </div>



                <div className="report-table-card">

                    <div className="table-header">

                        <div className="table-title">

                            <FaTags />

                            <h3>Top Categories</h3>

                        </div>

                    </div>

                    <div className="report-list">
                        {topCategories.length ? (
                            topCategories.map((item) => (
                                <div key={item._id}>
                                    {item.categoryName} - {item.orders} Orders
                                </div>
                            ))
                        ) : (
                            <p>No category data found.</p>
                        )}
                    </div>

                </div>

            </div>

        </div >


    );
};

export default AdminReports;
