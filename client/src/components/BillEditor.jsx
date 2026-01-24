import React, { useState, useEffect } from "react";
import BillPreview from "./BillPreview";
import "../styles/BillEditor.css";

const BillEditor = ({ billId, onSave, onClose }) => {
    const [bill, setBill] = useState(null);
    const [company, setCompany] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [newItem, setNewItem] = useState({
        ProductID: "",
        ProductName: "",
        Quantity: 1,
        UnitPrice: 0
    });
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const companyId = localStorage.getItem("activeCompanyId") || 1;

    useEffect(() => {
        if (billId) {
            fetchBill();
        } else {
            initializeNewBill();
        }
        fetchProducts();
        fetchCustomers();
        fetchCompany();
    }, [billId, companyId]);

    const fetchBill = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/bills/${billId}`, {
                headers: { "x-company-id": companyId }
            });
            if (!response.ok) throw new Error("Failed to fetch bill");
            const data = await response.json();
            setBill(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const initializeNewBill = () => {
        setBill({
            BillID: null,
            BillNumber: "NEW",
            CustomerID: "",
            BillDate: new Date().toISOString().split("T")[0],
            DueDate: "",
            Notes: "",
            Terms: "",
            BillStatus: "DRAFT",
            items: []
        });
        setLoading(false);
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/products", {
                headers: { "x-company-id": companyId }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/customers", {
                headers: { "x-company-id": companyId }
            });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    const fetchCompany = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/companies/${companyId}`);
            if (response.ok) {
                const data = await response.json();
                setCompany(data);
            }
        } catch (err) {
            console.error("Error fetching company:", err);
        }
    };

    const handleBillChange = (field, value) => {
        setBill(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddItem = () => {
        if (!newItem.ProductID || newItem.Quantity <= 0 || newItem.UnitPrice <= 0) {
            alert("Please fill all item fields");
            return;
        }

        const product = products.find(p => p.ProductID === parseInt(newItem.ProductID));
        const item = {
            ProductID: newItem.ProductID,
            ProductName: newItem.ProductName,
            Quantity: parseFloat(newItem.Quantity),
            UnitPrice: parseFloat(newItem.UnitPrice)
        };

        setBill(prev => ({
            ...prev,
            items: [...(prev.items || []), item]
        }));

        setNewItem({
            ProductID: "",
            ProductName: "",
            Quantity: 1,
            UnitPrice: 0
        });
    };

    const handleRemoveItem = (index) => {
        setBill(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleProductSelect = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p.ProductID === parseInt(productId));
        if (product) {
            setNewItem(prev => ({
                ...prev,
                ProductID: productId,
                ProductName: product.ProductName,
                UnitPrice: product.RetailPrice || product.UnitPrice
            }));
        }
    };

    const handleSaveBill = async () => {
        if (!bill.CustomerID) {
            alert("Please select a customer");
            return;
        }

        if (!bill.items || bill.items.length === 0) {
            alert("Please add at least one item");
            return;
        }

        try {
            const url = bill.BillID
                ? `http://localhost:5000/api/bills/${bill.BillID}`
                : "http://localhost:5000/api/bills";

            const method = bill.BillID ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "x-company-id": companyId
                },
                body: JSON.stringify(bill)
            });

            if (!response.ok) throw new Error("Failed to save bill");
            const data = await response.json();
            alert(`Bill ${bill.BillID ? "updated" : "created"} successfully`);
            if (onSave) onSave(data);
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleFinalize = async () => {
        if (!bill.BillID) {
            alert("Please save the bill first");
            return;
        }

        if (window.confirm("Are you sure you want to finalize this bill? It cannot be edited after finalization.")) {
            try {
                const response = await fetch(`http://localhost:5000/api/bills/${bill.BillID}/finalize`, {
                    method: "POST",
                    headers: { "x-company-id": companyId }
                });

                if (!response.ok) throw new Error("Failed to finalize bill");
                alert("Bill finalized successfully");
                handleBillChange("BillStatus", "FINAL");
            } catch (err) {
                alert("Error: " + err.message);
            }
        }
    };

    const isEditable = bill?.BillStatus === "DRAFT";

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    if (showPreview) {
        return (
            <BillPreview 
                bill={bill} 
                company={company} 
                customer={customers.find(c => c.CustomerID === parseInt(bill.CustomerID))}
                billId={bill.BillID}
                onBack={() => setShowPreview(false)}
                onSubmit={() => {
                    setShowPreview(false);
                    if (onSave) onSave();
                }}
            />
        );
    }

    return (
        <div className="bill-editor-container">
            <div className="editor-header">
                <h2>{bill?.BillID ? "Edit Bill" : "Create Bill"}</h2>
                {onClose && <button className="close-btn" onClick={onClose}>&times;</button>}
            </div>

            {bill && (
                <div className="editor-content">
                    <div className="editor-form">
                        <div className="form-section">
                            <h3>Bill Information</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Customer *</label>
                                    <select 
                                        value={bill.CustomerID || ""}
                                        onChange={(e) => handleBillChange("CustomerID", e.target.value)}
                                        disabled={!isEditable}
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map(cust => (
                                            <option key={cust.CustomerID} value={cust.CustomerID}>
                                                {cust.CompanyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bill Date</label>
                                    <input 
                                        type="date"
                                        value={bill.BillDate}
                                        onChange={(e) => handleBillChange("BillDate", e.target.value)}
                                        disabled={!isEditable}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input 
                                        type="date"
                                        value={bill.DueDate || ""}
                                        onChange={(e) => handleBillChange("DueDate", e.target.value)}
                                        disabled={!isEditable}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Add Items</h3>
                            <div className="add-item-row">
                                <div className="form-group">
                                    <label>Product</label>
                                    <select 
                                        value={newItem.ProductID}
                                        onChange={handleProductSelect}
                                        disabled={!isEditable}
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(prod => (
                                            <option key={prod.ProductID} value={prod.ProductID}>
                                                {prod.ProductName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input 
                                        type="number"
                                        value={newItem.Quantity}
                                        onChange={(e) => setNewItem(prev => ({...prev, Quantity: e.target.value}))}
                                        disabled={!isEditable}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Unit Price</label>
                                    <input 
                                        type="number"
                                        value={newItem.UnitPrice}
                                        onChange={(e) => setNewItem(prev => ({...prev, UnitPrice: e.target.value}))}
                                        disabled={!isEditable}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <button 
                                    className="btn-add-item"
                                    onClick={handleAddItem}
                                    disabled={!isEditable}
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="items-table-section">
                            <h3>Bill Items</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                        {isEditable && <th>Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.items && bill.items.length > 0 ? (
                                        bill.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.ProductName}</td>
                                                <td className="text-right">{item.Quantity}</td>
                                                <td className="text-right">₹{item.UnitPrice.toFixed(2)}</td>
                                                <td className="text-right">₹{(item.Quantity * item.UnitPrice).toFixed(2)}</td>
                                                {isEditable && (
                                                    <td>
                                                        <button 
                                                            className="btn-delete"
                                                            onClick={() => handleRemoveItem(index)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={isEditable ? 5 : 4} className="text-center">No items added</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Notes & Terms */}
                        <div className="form-section">
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea 
                                    value={bill.Notes || ""}
                                    onChange={(e) => handleBillChange("Notes", e.target.value)}
                                    placeholder="Add any notes for the customer"
                                    disabled={!isEditable}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Terms & Conditions</label>
                                <textarea 
                                    value={bill.Terms || ""}
                                    onChange={(e) => handleBillChange("Terms", e.target.value)}
                                    placeholder="Add payment terms or conditions"
                                    disabled={!isEditable}
                                    rows="3"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="editor-actions">
                            {isEditable && (
                                <>
                                    <button className="btn-primary" onClick={handleSaveBill}>
                                        Save Bill
                                    </button>
                                    <button className="btn-secondary" onClick={() => setShowPreview(true)}>
                                        Preview
                                    </button>
                                    <button className="btn-success" onClick={handleFinalize}>
                                        Finalize Bill
                                    </button>
                                </>
                            )}
                            {!isEditable && (
                                <>
                                    <button className="btn-secondary" onClick={() => setShowPreview(true)}>
                                        View Bill
                                    </button>
                                    <button className="btn-info" onClick={() => window.print()}>
                                        Print
                                    </button>
                                </>
                            )}
                            {onClose && (
                                <button className="btn-cancel" onClick={onClose}>
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillEditor;
