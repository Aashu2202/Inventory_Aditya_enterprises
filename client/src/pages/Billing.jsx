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
import BillPreview from '../components/BillPreview';
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
    const [company, setCompany] = useState(null);

    const [isCustModalOpen, setIsCustModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const barcodeInputRef = useRef(null);
    const [scanStatus, setScanStatus] = useState('');

    useEffect(() => {
        fetchInitialData();
        fetchCompany();
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

    const fetchCompany = async () => {
        try {
            const companyId = localStorage.getItem('activeCompanyId') || 1;
            const response = await axios.get(`http://localhost:5000/api/companies/${companyId}`);
            setCompany(response.data);
        } catch (error) {
            console.error('Error fetching company:', error);
        }
    };

    // Global Scanner Detection
    useEffect(() => {
        let buffer = '';
        let timer = null;

        const SCAN_END_KEYS = ['Enter', 'Tab'];

        const handleKeyPress = (e) => {
            // Ignore input fields typing
            if (
                document.activeElement &&
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
            ) {
                return;
            }

            // Clear previous timer
            if (timer) clearTimeout(timer);

            if (SCAN_END_KEYS.includes(e.key)) {
                if (buffer.length > 2) {
                    const scannedCode = buffer.trim();

                    const product = products.find(
                        p => p.Barcode && p.Barcode.toLowerCase() === scannedCode.toLowerCase()
                    );

                    if (product) {
                        handleSelectProductWrapper(product);
                    } else {
                        console.warn('Barcode not found:', scannedCode);
                    }
                }

                buffer = '';
                return;
            }

            buffer += e.key;

            // Reset buffer if no input after 300ms
            timer = setTimeout(() => {
                buffer = '';
            }, 300);
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [products]);



    const handleSelectProductWrapper = (product) => {
        // We need to call the logic that adds to cart.
        // It's cleaner to duplicate the add logic with functional update or move handleSelectProduct to use functional check
        setCart(prevCart => {
            const existingItem = prevCart.find((i) => i.ProductID === product.ProductID);
            if (existingItem) {
                // Return new cart with updated qty
                return prevCart.map(item => {
                    if (item.ProductID === product.ProductID) {
                        const qty = item.Quantity + 1;
                        const price = parseFloat(item.SalePrice);
                        const total = (qty * price).toFixed(2);
                        return { ...item, Quantity: qty, total };
                    }
                    return item;
                });
            } else {
                // New item
                const newItem = {
                    ...product,
                    Quantity: 1,
                    SalePrice: product.UnitPrice,
                    total: (product.UnitPrice * 1).toFixed(2)
                };
                return [...prevCart, newItem];
            }
        });
        setSearchTerm('');
        setShowSuggestions(false);
        // Refocus handled by side-effect or just keep current focus
    };

    useEffect(() => {
        if (searchTerm.trim().length > 0) {
            const term = searchTerm.toLowerCase();
            const filtered = products.filter(p =>
                p.ProductName.toLowerCase().includes(term) ||
                (p.Barcode && p.Barcode.toLowerCase().includes(term)) ||
                (p.HSNCode && p.HSNCode.toLowerCase().includes(term))
            ).slice(0, 8);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, products]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchTerm.trim().length > 0) {
            // Priority: Exact Barcode Match > Exact Name Match > First Suggestion
            const term = searchTerm.trim().toLowerCase();

            // Check for exact barcode match first (Scanner behavior)
            const exactMatch = products.find(p => p.Barcode && p.Barcode.toLowerCase() === term);

            if (exactMatch) {
                handleSelectProduct(exactMatch);
                e.preventDefault(); // Prevent form submission if any
                return;
            }

            // Fallback: If suggestions exist, take the first one
            if (suggestions.length > 0) {
                handleSelectProduct(suggestions[0]);
                e.preventDefault();
            }
        }
    };

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
        setSearchTerm(''); // Clear for next scan
        setShowSuggestions(false);
        // Keep focus on input for continuous scanning
        setTimeout(() => barcodeInputRef.current?.focus(), 10);
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
        const customer = customers.find(c => c.CustomerID === parseInt(selectedCustomerID));

        // Format bill data to match BillPreview component expectations
        const formattedBill = {
            BillNumber: billPreviewData.orderNumber,
            BillDate: new Date().toISOString(),
            BillStatus: 'DRAFT',
            items: billPreviewData.items.map(item => ({
                ProductName: item.ProductName,
                Quantity: item.Quantity,
                UnitPrice: parseFloat(item.SalePrice)
            }))
        };

        return (
            <BillPreview
                bill={formattedBill}
                company={company}
                customer={customer}
                billId={null}
                onBack={() => setShowBillPreview(false)}
                onSubmit={handleSubmitBill}
            />
        );
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
                                onKeyDown={handleKeyDown}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {scanStatus && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: scanStatus.includes('✅') ? '#dcfce7' : '#fee2e2',
                                    color: scanStatus.includes('✅') ? '#166534' : '#991b1b',
                                    padding: '8px',
                                    borderRadius: '0 0 4px 4px',
                                    fontSize: '13px',
                                    zIndex: 10,
                                    border: '1px solid',
                                    borderColor: scanStatus.includes('✅') ? '#86efac' : '#fca5a5'
                                }}>
                                    {scanStatus}
                                </div>
                            )}
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



export default Billing;
