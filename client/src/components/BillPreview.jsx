import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/BillPreview.css";

const BillPreview = ({ bill, company, customer, onBack, onSubmit, billId }) => {
    const [downloading, setDownloading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const subtotal = bill.items?.reduce((sum, item) => sum + (item.Quantity * item.UnitPrice), 0) || 0;
    const grandTotal = subtotal;

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const element = document.getElementById("bill-preview-content");
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`${bill.BillNumber}.pdf`);
        } catch (error) {
            alert("Error downloading PDF: " + error.message);
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSubmit = async () => {
        // If billId is null, this is from sales order - just call onSubmit
        if (!billId) {
            if (onSubmit) onSubmit();
            return;
        }

        if (window.confirm("Are you sure you want to finalize this bill?")) {
            try {
                setSubmitting(true);
                const companyId = localStorage.getItem("activeCompanyId") || 1;
                const response = await fetch(`http://localhost:5000/api/bills/${billId}/finalize`, {
                    method: "POST",
                    headers: { "x-company-id": companyId }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to finalize bill");
                }

                alert("Bill finalized successfully!");
                if (onSubmit) onSubmit();
            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="bill-preview-wrapper">
            <div className="bill-preview-container" id="bill-preview-content">
                <div className="bill-preview">
                    {/* Header */}
                    <div className="bill-header">
                        <div className="bill-company-info">
                            {company?.LogoPath && (
                                <img src={company.LogoPath} alt="Company Logo" className="bill-logo" />
                            )}
                            <div>
                                <h1>{company?.CompanyName || "Company Name"}</h1>
                                <p>{company?.Address || ""}</p>
                                <p>{company?.City || ""}, {company?.State || ""} - {company?.Country || ""}</p>
                                <p>Phone: {company?.Phone || ""}</p>
                                <p>Email: {company?.Email || ""}</p>
                            </div>
                        </div>

                        <div className="bill-title-section">
                            <h2 className="bill-title">INVOICE</h2>
                            <div className="bill-info">
                                <div className="info-row">
                                    <span className="label">Bill:</span>
                                    <span className="value invoice-data">{bill.BillNumber}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Date:</span>
                                    <span className="value invoice-data">{new Date(bill.BillDate).toLocaleDateString()}</span>
                                </div>
                                {bill.DueDate && (
                                    <div className="info-row">
                                        <span className="label">Due Date:</span>
                                        <span className="value invoice-data">{new Date(bill.DueDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {/* <div className="info-row">
                                    <span className="label">Status:</span>
                                    <span className={`status ${bill.BillStatus?.toLowerCase()}`}>{bill.BillStatus}</span>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Bill To Section */}
                    <div className="bill-to-section">
                        <div className="bill-to">
                            <h4>BILL TO:</h4>
                            <p className="customer-name">{customer?.CompanyName || "Customer Name"}</p>
                            {customer?.Address && <p>{customer.Address}</p>}
                            {customer?.City && <p>{customer.City}, {customer.State}</p>}
                            {customer?.Phone && <p>Phone: {customer.Phone}</p>}
                            {customer?.Email && <p>Email: {customer.Email}</p>}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bill-items-section">
                        <table className="bill-items-table">
                            <thead>
                                <tr>
                                    <th className="col-item">Item</th>
                                    <th className="col-qty">Quantity</th>
                                    <th className="col-price">Unit Price</th>
                                    <th className="col-total">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items && bill.items.length > 0 ? (
                                    bill.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="col-item">{item.ProductName || "Item"}</td>
                                            <td className="col-qty text-center">{item.Quantity}</td>
                                            <td className="col-price text-right">₹{item.UnitPrice.toFixed(2)}</td>
                                            <td className="col-total text-right">₹{(item.Quantity * item.UnitPrice).toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No items</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="bill-totals-section">
                        <div className="bill-totals">
                            <div className="total-row">
                                <span className="label">Subtotal:</span>
                                <span className="value">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span className="label">Grand Total:</span>
                                <span className="value">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms */}
                    {(bill.Notes || bill.Terms) && (
                        <div className="bill-notes-section">
                            {bill.Notes && (
                                <div className="notes">
                                    <h4>Notes:</h4>
                                    <p>{bill.Notes}</p>
                                </div>
                            )}
                            {bill.Terms && (
                                <div className="terms">
                                    <h4>Terms & Conditions:</h4>
                                    <p>{bill.Terms}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="bill-footer">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bill-preview-actions">
                <button className="btn-back" onClick={onBack} disabled={downloading || submitting}>
                    ← Back to Edit
                </button>
                <button className="btn-download" onClick={handleDownloadPDF} disabled={downloading || submitting}>
                    {downloading ? "Downloading..." : "⬇ Download PDF"}
                </button>
                <button className="btn-print" onClick={handlePrint} disabled={downloading || submitting}>
                    🖨 Print
                </button>
                {bill.BillStatus === "DRAFT" && (
                    <button className="btn-submit" onClick={handleSubmit} disabled={downloading || submitting}>
                        {submitting ? "Submitting..." : billId ? "✓ Confirm & Submit" : "✓ Confirm & Submit Order"}
                    </button>
                )}
                {bill.BillStatus === "FINAL" && (
                    <div className="bill-finalized-badge">
                        ✓ Bill Finalized
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillPreview;
