import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TrendingUp,
    Download,
    Search,
    Loader2,
    Package
} from 'lucide-react';
import '../styles/Reports.css';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('stock');
    const [stockSummary, setStockSummary] = useState([]);
    const [gstSales, setGstSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'stock') {
                const response = await axios.get('http://localhost:5000/api/products/stock-summary');
                setStockSummary(response.data);
            } else {
                const response = await axios.get('http://localhost:5000/api/orders/gst-sales');
                setGstSales(response.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = activeTab === 'stock'
        ? stockSummary.filter(s => s.ProductName.toLowerCase().includes(searchTerm.toLowerCase()))
        : gstSales.filter(s => s.InvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || s.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalStockValue = stockSummary.reduce((acc, item) => acc + (parseFloat(item.TotalValue) || 0), 0);
    const totalSalesValue = gstSales.reduce((acc, sale) => acc + (parseFloat(sale.TotalAmount) || 0), 0);

    if (loading && (stockSummary.length === 0 && gstSales.length === 0)) return <div className="loader-container"><Loader2 className="spinning" /> <span>Generating report...</span></div>;

    return (
        <div className="reports-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Reports & Analytics</h1>
                    <p>Financial and inventory insights for your enterprise</p>
                </div>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={() => window.print()}>
                        <Download size={18} />
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            <div className="stats-row">
                <div className="report-stat-card">
                    <div className="r-stat-info">
                        <span className="r-label">Inventory Value</span>
                        <span className="r-value">₹{totalStockValue.toLocaleString()}</span>
                        <span className="r-trend">Total Stock Asset</span>
                    </div>
                    <div className="r-icon rev" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Package size={24} /></div>
                </div>
                <div className="report-stat-card">
                    <div className="r-stat-info">
                        <span className="r-label">Cumulative Sales</span>
                        <span className="r-value">₹{totalSalesValue.toLocaleString()}</span>
                        <span className="r-trend">Gross Revenue</span>
                    </div>
                    <div className="r-icon count" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><TrendingUp size={24} /></div>
                </div>
            </div>

            <div className="reports-tab-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'stock' ? 'none' : '1px solid #334155', background: activeTab === 'stock' ? '#6366f1' : 'transparent', color: 'white', cursor: 'pointer' }}
                >
                    Stock Summary
                </button>
                <button
                    className={`tab-btn ${activeTab === 'gst' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gst')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: activeTab === 'gst' ? 'none' : '1px solid #334155', background: activeTab === 'gst' ? '#6366f1' : 'transparent', color: 'white', cursor: 'pointer' }}
                >
                    GST Sales Report
                </button>
            </div>

            <div className="reports-card main-table-card">
                <div className="card-filters">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder={activeTab === 'stock' ? "Filter by product..." : "Filter by invoice or customer..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Refreshing data...</div>
                    ) : (
                        <table>
                            {activeTab === 'stock' ? (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Total Stock</th>
                                            <th>Unit Price</th>
                                            <th>Asset Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="bold">{item.ProductName}</td>
                                                <td><span className="cat-badge">{item.CategoryName}</span></td>
                                                <td className={item.TotalQuantity < 10 ? 'text-warning' : ''} style={{ fontWeight: 700 }}>
                                                    {item.TotalQuantity || 0}
                                                </td>
                                                <td>₹{item.UnitPrice}</td>
                                                <td className="bold">₹{parseFloat(item.TotalValue).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            ) : (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Date</th>
                                            <th>Customer</th>
                                            <th>GST Type</th>
                                            <th>Amount</th>
                                            <th>GST Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((sale, idx) => (
                                            <tr key={idx}>
                                                <td className="bold">{sale.InvoiceNumber}</td>
                                                <td>{new Date(sale.OrderDate).toLocaleDateString()}</td>
                                                <td>{sale.CustomerName}</td>
                                                <td>{sale.GSTType}</td>
                                                <td className="bold">₹{parseFloat(sale.TotalAmount).toLocaleString()}</td>
                                                <td>
                                                    <span className={`method-badge ${sale.IsGST ? 'upi' : 'cash'}`}>
                                                        {sale.IsGST ? 'GST Invoice' : 'Non-GST'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
