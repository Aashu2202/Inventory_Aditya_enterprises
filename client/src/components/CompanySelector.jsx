import React, { useState, useEffect } from "react";

const CompanySelector = ({ onCompanyChange, currentCompany }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleCompanyChange = (e) => {
        const companyId = parseInt(e.target.value);
        const selected = companies.find(c => c.CompanyID === companyId);
        if (onCompanyChange) {
            onCompanyChange(selected);
        }
        // Also store in localStorage for persistence
        localStorage.setItem("activeCompanyId", companyId);
    };

    if (loading) return <div className="company-selector">Loading companies...</div>;

    return (
        <div className="company-selector">
            <label htmlFor="company-select">Select Company:</label>
            <select 
                id="company-select"
                value={currentCompany?.CompanyID || 1}
                onChange={handleCompanyChange}
                className="company-select"
            >
                {companies.map(company => (
                    <option key={company.CompanyID} value={company.CompanyID}>
                        {company.CompanyName}
                    </option>
                ))}
            </select>
            {error && <div className="error-text">{error}</div>}
        </div>
    );
};

export default CompanySelector;
