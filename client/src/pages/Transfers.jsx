import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeftRight,
    Warehouse,
    Package,
    Calendar,
    ArrowRight,
    Loader2
} from 'lucide-react';
import '../styles/Transfers.css';

const Transfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/transfers');
            setTransfers(response.data);
        } catch (error) {
            console.error('Error fetching transfers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading transfer history...</span></div>;

    return (
        <div className="transfers-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Stock Transfers</h1>
                    <p>Track history of inventory movements between locations</p>
                </div>
            </div>

            <div className="transfers-list">
                {transfers.length > 0 ? transfers.map((t) => (
                    <div key={t.TransferId} className="transfer-row-card">
                        <div className="transfer-header">
                            <span className="transfer-date">
                                <Calendar size={14} /> {new Date(t.TransferDate).toLocaleDateString()}
                            </span>
                            <span className="transfer-id">TRF-{t.TransferId}</span>
                        </div>
                        <div className="transfer-content">
                            <div className="transfer-item">
                                <div className="icon-box"><Package size={20} /></div>
                                <div className="item-info">
                                    <span className="label">Product</span>
                                    <span className="value">{t.ProductName}</span>
                                </div>
                            </div>
                            <div className="transfer-path">
                                <div className="store-node">
                                    <Warehouse size={16} />
                                    <span>{t.FromStore}</span>
                                </div>
                                <div className="path-arrow">
                                    <span className="qty-tag">{t.Quantity} Units</span>
                                    <ArrowRight size={20} />
                                </div>
                                <div className="store-node">
                                    <Warehouse size={16} />
                                    <span>{t.ToStore}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <ArrowLeftRight size={48} />
                        <p>No stock transfers recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transfers;
