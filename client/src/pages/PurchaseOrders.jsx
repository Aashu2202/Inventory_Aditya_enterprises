import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import '../styles/PurchaseOrders.css';

const PurchaseOrders = () => {
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        purchaseData: {
            SupplierID: '',
            InvoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            PurchaseDate: new Date().toISOString().split('T')[0],
            TotalAmount: 0
        },
        details: [],
        warehouseID: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [purRes, supRes, prodRes, whRes] = await Promise.all([
                axios.get('http://localhost:5000/api/purchases'),
                axios.get('http://localhost:5000/api/suppliers'),
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/warehouses')
            ]);
            setPurchases(purRes.data);
            setSuppliers(supRes.data);
            setProducts(prodRes.data);
            setWarehouses(whRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            details: [...formData.details, { ProductID: '', Quantity: 1, UnitCost: 0, total: 0 }]
        });
    };

    const updateItem = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;

        if (field === 'ProductID') {
            const prod = products.find(p => p.ProductID === parseInt(value));
            if (prod) {
                newDetails[index].UnitCost = prod.UnitPrice;
                // Calculate line total (matching SQL PERSISTED logic)
                const qty = parseFloat(newDetails[index].Quantity) || 0;
                const cost = parseFloat(newDetails[index].UnitCost) || 0;

                newDetails[index].total = (qty * cost).toFixed(2);

                setFormData({ ...formData, details: newDetails });
            }
        }
    };

    const removeItem = (index) => {
        setFormData({
            ...formData,
            details: formData.details.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.details.length === 0) return alert("Please add at least one item.");
        if (!formData.warehouseID) return alert("Please select a warehouse for stock entry.");

        const totalAmount = formData.details.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const submitData = {
            ...formData,
            purchaseData: { ...formData.purchaseData, TotalAmount: totalAmount }
        };

        try {
            await axios.post('http://localhost:5000/api/purchases', submitData);
            fetchInitialData();
            setIsModalOpen(false);
            // Reset form
            setFormData({
                purchaseData: {
                    SupplierID: '',
                    InvoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                    PurchaseDate: new Date().toISOString().split('T')[0],
                    IsGST: 1,
                    GSTType: 'CGST_SGST',
                    TotalAmount: 0
                },
                details: [],
                warehouseID: ''
            });
        } catch (error) {
            console.error('Error recording purchase:', error);
            alert('Failed to record purchase.');
        }
    };

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading purchase reports...</span></div>;

    return (
        <div className="purchase-orders-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Purchases & In-stock</h1>
                    <p>Record new stock purchases and update warehouse inventory</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        <span>Record Purchase</span>
                    </button>
                </div>
            </div>

            <div className="orders-table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Supplier</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map((p) => (
                            <tr key={p.PurchaseID}>
                                <td className="order-no">{p.InvoiceNumber}</td>
                                <td>{p.SupplierName}</td>
                                <td className="date">{new Date(p.PurchaseDate).toLocaleDateString()}</td>
                                <td className="amount">₹{p.TotalAmount}</td>
                                <td><button className="view-btn"><ChevronRight size={18} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content large" style={{ maxWidth: '1000px' }}>
                        <div className="modal-header">
                            <h2>New Purchase Entry</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Supplier <span className="required">*</span></label>
                                    <select
                                        value={formData.purchaseData.SupplierID}
                                        onChange={(e) => setFormData({ ...formData, purchaseData: { ...formData.purchaseData, SupplierID: e.target.value } })}
                                        required
                                    >
                                        <option value="">Select Supplier...</option>
                                        {suppliers.map(s => <option key={s.SupplierID} value={s.SupplierID}>{s.CompanyName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Store In Warehouse <span className="required">*</span></label>
                                    <select
                                        value={formData.warehouseID}
                                        onChange={(e) => setFormData({ ...formData, warehouseID: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Warehouse...</option>
                                        {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Invoice Number</label>
                                    <input
                                        type="text"
                                        value={formData.purchaseData.InvoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, purchaseData: { ...formData.purchaseData, InvoiceNumber: e.target.value } })}
                                    />
                                </div>

                            </div>

                            <div className="items-section">
                                <div className="section-header">
                                    <h3>Purchase Items</h3>
                                    <button type="button" onClick={handleAddItem} className="add-item-btn">
                                        <Plus size={14} /> Add Product
                                    </button>
                                </div>

                                <div className="items-list">
                                    {formData.details.map((item, index) => (
                                        <div key={index} className="po-item-row" style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 40px' }}>
                                            <div className="item-field">
                                                <select
                                                    value={item.ProductID}
                                                    onChange={(e) => updateItem(index, 'ProductID', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Product...</option>
                                                    {products.map(p => <option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
                                                </select>
                                            </div>
                                            <div className="item-field">
                                                <input type="number" placeholder="Qty" value={item.Quantity} onChange={(e) => updateItem(index, 'Quantity', e.target.value)} required />
                                            </div>
                                            <div className="item-field">
                                                <input type="number" placeholder="Cost" value={item.UnitCost} onChange={(e) => updateItem(index, 'UnitCost', e.target.value)} required />
                                            </div>
                                            <div className="item-field total">₹{item.total}</div>
                                            <button type="button" onClick={() => removeItem(index)} className="remove-item-btn"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <div className="grand-total">
                                    <span>Total Amount: </span>
                                    <strong>₹{formData.details.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)}</strong>
                                </div>
                                <div className="actions">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                                    <button type="submit" className="primary-btn">Record Purchase</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
