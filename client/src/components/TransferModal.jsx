import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Package, MoveRight, Warehouse, Hash, AlertCircle } from 'lucide-react';
import '../styles/Modals.css';

const TransferModal = ({ isOpen, onClose, onTransferComplete }) => {
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ProductId: '',
        FromStoreId: '',
        ToStoreId: '',
        Quantity: '',
        Status: 'Completed'
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [prodRes, storeRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/stores')
            ]);
            setProducts(prodRes.data);
            setStores(storeRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.FromStoreId === formData.ToStoreId) {
            alert("Source and destination stores cannot be the same.");
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/transfers', formData);
            onTransferComplete();
            onClose();
            setFormData({
                ProductId: '',
                FromStoreId: '',
                ToStoreId: '',
                Quantity: '',
                Status: 'Completed'
            });
        } catch (error) {
            console.error('Error transferring stock:', error);
            alert('Error transferring stock. Ensure sufficient inventory exists at the source.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Stock Transfer</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group full-width">
                        <label>Select Product <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <Package size={18} />
                            <select
                                value={formData.ProductId}
                                onChange={(e) => setFormData({ ...formData, ProductId: e.target.value })}
                                required
                            >
                                <option value="">Choose item to transfer...</option>
                                {products.map(p => (
                                    <option key={p.ProductId} value={p.ProductId}>{p.ProductName} ({p.SKU})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Source Store <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Warehouse size={18} />
                                <select
                                    value={formData.FromStoreId}
                                    onChange={(e) => setFormData({ ...formData, FromStoreId: e.target.value })}
                                    required
                                >
                                    <option value="">From...</option>
                                    {stores.map(s => (
                                        <option key={s.StoreId} value={s.StoreId}>{s.StoreName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Destination Store <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Warehouse size={18} />
                                <select
                                    value={formData.ToStoreId}
                                    onChange={(e) => setFormData({ ...formData, ToStoreId: e.target.value })}
                                    required
                                >
                                    <option value="">To...</option>
                                    {stores.map(s => (
                                        <option key={s.StoreId} value={s.StoreId}>{s.StoreName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Transfer Quantity <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Hash size={18} />
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.Quantity}
                                    onChange={(e) => setFormData({ ...formData, Quantity: e.target.value })}
                                    placeholder="Count"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="info-box">
                                <AlertCircle size={16} />
                                <span>Transaction will adjust stock across both locations instantly.</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn" disabled={loading}>Cancel</button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Complete Transfer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;
