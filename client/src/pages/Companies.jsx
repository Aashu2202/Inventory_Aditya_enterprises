import React, { useState, useEffect } from "react";
import AddCompanyModal from "../components/AddCompanyModal";
import "../styles/CompanyList.css";

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/companies");
            if (!response.ok) throw new Error("Failed to fetch companies");
            const data = await response.json();
            setCompanies(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching companies:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompany = () => {
        setEditingCompany(null);
        setShowModal(true);
    };

    const handleEditCompany = (company) => {
        setEditingCompany(company);
        setShowModal(true);
    };

    const handleDeleteCompany = async (companyId) => {
        if (companyId === 1) {
            alert("Cannot delete the default company");
            return;
        }

        if (window.confirm("Are you sure you want to delete this company?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/companies/${companyId}`, {
                    method: "DELETE"
                });
                if (!response.ok) throw new Error("Failed to delete company");
                await response.json();
                fetchCompanies();
                alert("Company deleted successfully");
            } catch (err) {
                alert("Error deleting company: " + err.message);
            }
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            const url = editingCompany 
                ? `http://localhost:5000/api/companies/${editingCompany.CompanyID}`
                : "http://localhost:5000/api/companies";
            
            const method = editingCompany ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save company");
            }

            await response.json();
            setShowModal(false);
            setEditingCompany(null);
            fetchCompanies();
            alert(`Company ${editingCompany ? "updated" : "created"} successfully`);
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return <div className="loading">Loading companies...</div>;

    return (
        <div className="company-list-container">
            <div className="company-list-header">
                <h2>Company Management</h2>
                <button className="btn-primary" onClick={handleAddCompany}>
                    + Add New Company
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {companies.length === 0 ? (
                <p className="no-data">No companies found</p>
            ) : (
                <div className="company-grid">
                    {companies.map(company => (
                        <div key={company.CompanyID} className="company-card">
                            <div className="company-card-header">
                                <h3>{company.CompanyName}</h3>
                                <div className="company-status">
                                    {company.IsActive ? <span className="badge-active">Active</span> : <span className="badge-inactive">Inactive</span>}
                                </div>
                            </div>
                            
                            <div className="company-card-body">
                                {company.Address && <p><strong>Address:</strong> {company.Address}</p>}
                                {(company.City || company.State) && (
                                    <p><strong>Location:</strong> {company.City}, {company.State}</p>
                                )}
                                {company.Phone && <p><strong>Phone:</strong> {company.Phone}</p>}
                                {company.Email && <p><strong>Email:</strong> {company.Email}</p>}
                                {company.TaxID && <p><strong>Tax ID:</strong> {company.TaxID}</p>}
                            </div>

                            <div className="company-card-footer">
                                <button 
                                    className="btn-secondary"
                                    onClick={() => handleEditCompany(company)}
                                >
                                    Edit
                                </button>
                                {company.CompanyID !== 1 && (
                                    <button 
                                        className="btn-danger"
                                        onClick={() => handleDeleteCompany(company.CompanyID)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddCompanyModal 
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                editingCompany={editingCompany}
            />
        </div>
    );
};

export default CompanyList;
