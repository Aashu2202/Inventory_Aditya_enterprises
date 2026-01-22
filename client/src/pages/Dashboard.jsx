import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    Package,
    AlertTriangle,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/dashboard/stats');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="loader-container full">
            <Loader2 className="spinning" size={40} />
            <p>Syncing your business data...</p>
        </div>
    );

    const stats = [
        {
            title: 'Total Sales',
            value: `₹${(data?.totalSales || 0).toLocaleString()}`,
            icon: <TrendingUp size={24} />,
            color: '#6366f1',
            trend: '+12.5%',
            isUp: true
        },
        {
            title: 'Total Products',
            value: data?.productCount || 0,
            icon: <Package size={24} />,
            color: '#8b5cf6',
            trend: '+3',
            isUp: true
        },
        {
            title: 'Low Stock',
            value: `${data?.lowStockCount || 0} Items`,
            icon: <AlertTriangle size={24} />,
            color: '#ef4444',
            trend: '-2',
            isUp: false
        },
        {
            title: 'Stock Value',
            value: `₹${(data?.stockValue || 0).toLocaleString()}`,
            icon: <DollarSign size={24} />,
            color: '#10b981',
            trend: '+5.2%',
            isUp: true
        },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Overview</h1>
                <p>Welcome to Aditya Enterprises Inventory Management</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-content">
                            <div className="stat-label">{stat.title}</div>
                            <div className="stat-value">{stat.value}</div>
                            <div className={`stat-trend ${stat.isUp ? 'up' : 'down'}`}>
                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                <span>{stat.trend} from last month</span>
                            </div>
                        </div>
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card recent-sales">
                    <div className="card-header">
                        <h3>Recent Sales</h3>
                        <a href="/reports" className="view-all">View All</a>
                    </div>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Bill No.</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentSales?.map((sale) => (
                                    <tr key={sale.SaleId}>
                                        <td className="bold">{sale.BillNumber}</td>
                                        <td>{new Date(sale.SaleDate).toLocaleDateString()}</td>
                                        <td>{sale.CustomerName}</td>
                                        <td className="bold">₹{sale.GrandTotal}</td>
                                        <td><span className={`status-badge success`}>{sale.PaymentMode}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card quick-links">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="actions-list">
                        <a href="/billing" className="action-item">
                            <div className="action-icon rev"><DollarSign size={20} /></div>
                            <span>New Billing</span>
                        </a>
                        <a href="/inventory" className="action-item">
                            <div className="action-icon stock"><Package size={20} /></div>
                            <span>Manage Stock</span>
                        </a>
                        <a href="/reports" className="action-item">
                            <div className="action-icon report"><TrendingUp size={20} /></div>
                            <span>Sales Reports</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
