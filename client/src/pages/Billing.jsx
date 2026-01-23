import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Barcode,
    ShoppingCart,
    CreditCard,
    Banknote,
    Smartphone,
    ChevronRight,
    User,
    Warehouse,
    Plus,
    Minus,
    Trash2,
    PlusCircle
} from 'lucide-react';
import AddCustomerModal from '../components/AddCustomerModal';
import '../styles/Billing.css';

const Billing = () => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [selectedCustomerID, setSelectedCustomerID] = useState('');
    const [selectedWarehouseID, setSelectedWarehouseID] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [discount, setDiscount] = useState(0);
    const [billType, setBillType] = useState('KACCHA');
    const [gstType, setGstType] = useState('SGST');

    const [showBillPreview, setShowBillPreview] = useState(false);
    const [billPreviewData, setBillPreviewData] = useState(null);

    const [isCustModalOpen, setIsCustModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const barcodeInputRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
        barcodeInputRef.current?.focus();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [prodRes, custRes, whRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/customers'),
                axios.get('http://localhost:5000/api/warehouses')
            ]);
            setProducts(prodRes.data);
            setCustomers(custRes.data);
            setWarehouses(whRes.data);
            if (whRes.data.length > 0) setSelectedWarehouseID(whRes.data[0].WarehouseID);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        if (searchTerm.trim().length > 0) {
            const filtered = products.filter(p =>
                p.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.Barcodes && p.Barcodes.some(b => b.Barcode.includes(searchTerm)))
            ).slice(0, 8);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, products]);

    const handleSelectProduct = (product) => {
        const existingItem = cart.find((i) => i.ProductID === product.ProductID);
        if (existingItem) {
            updateQuantity(product.ProductID, existingItem.Quantity + 1);
        } else {
            const newItem = {
                ...product,
                Quantity: 1,
                SalePrice: product.UnitPrice,
                total: (product.UnitPrice * 1).toFixed(2)
            };
            setCart([...cart, newItem]);
        }
        setSearchTerm('');
        setShowSuggestions(false);
        barcodeInputRef.current?.focus();
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        setCart(cart.map(item => {
            if (item.ProductID === productId) {
                const qty = newQty;
                const price = parseFloat(item.SalePrice);
                const total = (qty * price);
                return { ...item, Quantity: qty, total: total.toFixed(2) };
            }
            return item;
        }));
    };

    const removeItem = (productId) => {
        setCart(cart.filter(i => i.ProductID !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Cart is empty!");
        if (!selectedCustomerID) return alert("Please select a customer.");
        if (!selectedWarehouseID) return alert("Please select a warehouse for stock deduction.");

        // Prepare bill preview data
        const customer = customers.find(c => c.CustomerID === parseInt(selectedCustomerID));
        const previewData = {
            billType,
            customer,
            items: cart,
            subTotal,
            gstTotal: billType === 'KACCHA' ? 0 : gstTotal,
            discount,
            finalTotal: billType === 'KACCHA' ? (subTotal - discount).toFixed(2) : finalTotal,
            paymentMode,
            gstType,
            orderNumber: 'ORD-' + Date.now().toString().slice(-6),
            orderDate: new Date().toLocaleDateString(),
            warehouseID: selectedWarehouseID
        };

        setBillPreviewData(previewData);
        setShowBillPreview(true);
    };

    const handleSubmitBill = async () => {
        if (!billPreviewData) return;

        const orderData = {
            orderData: {
                CustomerID: selectedCustomerID,
                OrderNumber: billPreviewData.orderNumber,
                OrderDate: new Date().toISOString().split('T')[0],
                TotalAmount: billPreviewData.finalTotal,
                OrderStatus: 'Completed'
            },
            details: cart.map(i => ({
                ProductID: i.ProductID,
                Quantity: i.Quantity,
                UnitPrice: i.SalePrice
            })),
            warehouseID: billPreviewData.warehouseID
        };

        try {
            await axios.post('http://localhost:5000/api/orders', orderData);
            alert("Order completed successfully!");
            setCart([]);
            setDiscount(0);
            setSelectedCustomerID('');
            setShowBillPreview(false);
            setBillPreviewData(null);
        } catch (error) {
            console.error('Order failed:', error);
            alert("Error completing order. " + (error.response?.data?.message || "Check stock levels."));
        }
    };

    const subTotal = cart.reduce((sum, i) => sum + (i.Quantity * i.SalePrice), 0);
    const gstTotal = billType === 'KACCHA' ? 0 : (subTotal * 0.18);
    const finalTotal = (subTotal + gstTotal - discount).toFixed(2);

    // Return bill preview if showing
    if (showBillPreview && billPreviewData) {
        return <BillPreview data={billPreviewData} onSubmit={handleSubmitBill} onClose={() => setShowBillPreview(false)} />;
    }

    return (
        <div className="billing-container">
            <div className="billing-main">
                <div className="billing-header">
                    <div className="search-section">
                        <div className="billing-search">
                            <Barcode size={22} className="barcode-icon" />
                            <input
                                ref={barcodeInputRef}
                                type="text"
                                placeholder="Scan Barcode or Search Product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="suggestions-dropdown">
                                    {suggestions.map((p) => (
                                        <li key={p.ProductID} onMouseDown={() => handleSelectProduct(p)}>
                                            <div className="s-info">
                                                <span className="s-name">{p.ProductName}</span>
                                                <span className="s-meta">₹{p.UnitPrice} | HSN: {p.HSNCode}</span>
                                            </div>
                                            <ChevronRight size={16} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="customer-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0 }}>Billing Details</h4>
                            <button
                                onClick={() => setIsCustModalOpen(true)}
                                className="icon-btn"
                                title="Add New Customer"
                                style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: '4px', padding: '4px 8px' }}
                            >
                                <PlusCircle size={16} style={{ marginRight: '4px' }} />
                                <span style={{ fontSize: '12px' }}>New Customer</span>
                            </button>
                        </div>
                        <div className="customer-details-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div className="customer-field">
                                <label>Customer</label>
                                <select value={selectedCustomerID} onChange={(e) => setSelectedCustomerID(e.target.value)} required>
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.CompanyName}</option>)}
                                </select>
                            </div>
                            <div className="customer-field">
                                <label>Dispatched From</label>
                                <select value={selectedWarehouseID} onChange={(e) => setSelectedWarehouseID(e.target.value)} required>
                                    <option value="">Select Warehouse...</option>
                                    {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseName}</option>)}
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="cart-table-wrapper">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length > 0 ? cart.map((item) => (
                                <tr key={item.ProductID}>
                                    <td>
                                        <div className="cart-item-info">
                                            <span className="name">{item.ProductName}</span>
                                        </div>
                                    </td>
                                    <td>₹{item.SalePrice}</td>
                                    <td>
                                        <div className="qty-control">
                                            <button onClick={() => updateQuantity(item.ProductID, item.Quantity - 1)}><Minus size={14} /></button>
                                            <span>{item.Quantity}</span>
                                            <button onClick={() => updateQuantity(item.ProductID, item.Quantity + 1)}><Plus size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="item-total">₹{item.total}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => removeItem(item.ProductID)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="empty-cart">
                                        <ShoppingCart size={48} />
                                        <p>Add products to start generating the bill</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="billing-summary">
                <div className="summary-card">
                    <h3>Summary</h3>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Discount</span>
                            <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="summary-row grand-total">
                            <span>Final Amount</span>
                            <span>₹{finalTotal}</span>
                        </div>
                    </div>

                    <div className="payment-options">
                        <label>Payment Mode</label>
                        <div className="payment-grid">
                            {['Cash', 'UPI', 'Card'].map(m => (
                                <button key={m} className={`pay-btn ${paymentMode === m ? 'active' : ''}`} onClick={() => setPaymentMode(m)}>
                                    {m === 'Cash' && <Banknote size={16} />}
                                    {m === 'UPI' && <Smartphone size={16} />}
                                    {m === 'Card' && <CreditCard size={16} />}
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>



                    <div className="summary-actions" style={{ marginTop: '20px' }}>
                        <button className="checkout-btn" onClick={handleCheckout} style={{ width: '100%' }}>
                            Generate Bill <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <AddCustomerModal
                isOpen={isCustModalOpen}
                onClose={() => setIsCustModalOpen(false)}
                onCustomerAdded={(newId) => {
                    fetchCustomers();
                    setSelectedCustomerID(newId);
                }}
            />
        </div>
    );
};

const BillPreview = ({ data, onSubmit, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#1e293b',
                borderRadius: '12px',
                padding: '32px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    <h2 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '1.5rem' }}>
                        Invoice
                    </h2>
                    <p style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Order #: {data.orderNumber} | Date: {data.orderDate}
                    </p>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: '20px', background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '0.85rem' }}>BILL TO:</h4>
                    <p style={{ margin: '0', color: '#f8fafc', fontWeight: '600' }}>{data.customer?.CompanyName}</p>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {data.customer?.City}, {data.customer?.State}
                    </p>
                </div>

                {/* Items */}
                <div style={{ marginBottom: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '8px', color: '#cbd5e1', fontWeight: '600' }}>Item</th>
                                <th style={{ textAlign: 'center', padding: '8px', color: '#cbd5e1', fontWeight: '600', width: '60px' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '8px', color: '#cbd5e1', fontWeight: '600', width: '80px' }}>Price</th>
                                <th style={{ textAlign: 'right', padding: '8px', color: '#cbd5e1', fontWeight: '600', width: '100px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <td style={{ padding: '8px', color: '#f8fafc' }}>
                                        {item.ProductName}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center', color: '#f8fafc' }}>{item.Quantity}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#f8fafc' }}>₹{parseFloat(item.SalePrice).toFixed(2)}</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: '#f8fafc' }}>₹{parseFloat(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    borderLeft: '4px solid #6366f1'
                }}>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                            <span>Subtotal:</span>
                            <span>₹{parseFloat(data.subTotal).toFixed(2)}</span>
                        </div>
                        {data.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                                <span>Discount:</span>
                                <span>-₹{parseFloat(data.discount).toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#f8fafc',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            paddingTop: '8px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <span>Total:</span>
                            <span>₹{data.finalTotal}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div style={{ textAlign: 'center', marginBottom: '20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <p style={{ margin: '0' }}>Payment Mode: <strong style={{ color: '#cbd5e1' }}>{data.paymentMode}</strong></p>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #475569',
                            background: 'transparent',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                        }}
                    >
                        Back to Edit
                    </button>
                    <button
                        onClick={onSubmit}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#6366f1',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#4f46e5';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#6366f1';
                        }}
                    >
                        ✓ Confirm & Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
