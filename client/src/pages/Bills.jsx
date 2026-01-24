import React, { useState, useEffect } from "react";
import BillEditor from "../components/BillEditor";
import BillPreview from "../components/BillPreview";
import "../styles/Bills.css";

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [company, setCompany] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [filterStatus, setFilterStatus] = useState("ALL");

    const companyId = localStorage.getItem("activeCompanyId") || 1;

    useEffect(() => {
        fetchBills();
        fetchCompany();
        fetchCustomers();
    }, [companyId, filterStatus]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/bills", {
                headers: { "x-company-id": companyId }
            });
            if (!response.ok) throw new Error("Failed to fetch bills");
            let data = await response.json();
            
            if (filterStatus !== "ALL") {
                data = data.filter(b => b.BillStatus === filterStatus);
            }
            
            setBills(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching bills:", err);
        } finally {
            setLoading(false);
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

    const handleCreateBill = () => {
        setSelectedBill(null);
        setShowEditor(true);
    };

    const handleEditBill = (bill) => {
        setSelectedBill(bill);
        setShowEditor(true);
    };

    const handleViewBill = async (billId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bills/${billId}`, {
                headers: { "x-company-id": companyId }
            });
            if (response.ok) {
                const bill = await response.json();
                const billCustomer = customers.find(c => c.CustomerID === bill.CustomerID);
                setSelectedBill(bill);
                setCustomer(billCustomer);
                setShowPreview(true);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleDeleteBill = async (billId) => {
        if (window.confirm("Are you sure you want to cancel this bill?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/bills/${billId}/cancel`, {
                    method: "POST",
                    headers: { "x-company-id": companyId }
                });
                if (!response.ok) throw new Error("Failed to cancel bill");
                alert("Bill cancelled successfully");
                fetchBills();
            } catch (err) {
                alert("Error: " + err.message);
            }
        }
    };

    const handleEditorClose = () => {
        setShowEditor(false);
        setSelectedBill(null);
        fetchBills();
    };

    const handlePreviewClose = () => {
        setShowPreview(false);
        setSelectedBill(null);
        setCustomer(null);
    };

    const getStatusBadge = (status) => {
        const classes = {
            DRAFT: "badge-draft",
            FINAL: "badge-final",
            CANCELLED: "badge-cancelled"
        };
        return classes[status] || "badge-default";
    };

    if (showEditor) {
        return (
            <BillEditor 
                billId={selectedBill?.BillID}
                onSave={() => {
                    setShowEditor(false);
                    fetchBills();
                }}
                onClose={handleEditorClose}
            />
        );
    }

    if (showPreview && selectedBill) {
        return (
            <BillPreview 
                bill={selectedBill} 
                company={company} 
                customer={customer}
                billId={selectedBill.BillID}
                onBack={() => {
                    setShowPreview(false);
                    setSelectedBill(null);
                    setCustomer(null);
                }}
                onSubmit={() => {
                    setShowPreview(false);
                    setSelectedBill(null);
                    setCustomer(null);
                    fetchBills();
                }}
            />
        );
    }

    return (
        <div className="bills-container">
            <div className="bills-header">
                <h2>Bills & Invoices</h2>
                <button className="btn-primary" onClick={handleCreateBill}>
                    + Create Bill
                </button>
            </div>

            <div className="bills-filters">
                <label>Filter by Status:</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">All Bills</option>
                    <option value="DRAFT">Draft</option>
                    <option value="FINAL">Finalized</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading bills...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : bills.length === 0 ? (
                <div className="no-data">
                    <p>No bills found. {filterStatus === "ALL" && <span>Create one to get started!</span>}</p>
                </div>
            ) : (
                <div className="bills-table-container">
                    <table className="bills-table">
                        <thead>
                            <tr>
                                <th>Bill #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr key={bill.BillID}>
                                    <td className="bill-number">{bill.BillNumber}</td>
                                    <td>{bill.CustomerName || "Unknown"}</td>
                                    <td>{new Date(bill.BillDate).toLocaleDateString()}</td>
                                    <td className="amount text-right">₹{(bill.GrandTotal || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(bill.BillStatus)}`}>
                                            {bill.BillStatus}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button 
                                            className="btn-view"
                                            onClick={() => handleViewBill(bill.BillID)}
                                            title="View"
                                        >
                                            View
                                        </button>
                                        {bill.BillStatus === "DRAFT" && (
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditBill(bill)}
                                                title="Edit"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {bill.BillStatus !== "CANCELLED" && (
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDeleteBill(bill.BillID)}
                                                title="Cancel"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Bills;
