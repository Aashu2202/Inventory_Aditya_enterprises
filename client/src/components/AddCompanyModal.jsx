import React, { useState, useEffect } from "react";
import "../styles/Modals.css";

const AddCompanyModal = ({ show, onClose, onSubmit, editingCompany }) => {
    const [formData, setFormData] = useState({
        CompanyName: "",
        Address: "",
        City: "",
        State: "",
        Country: "India",
        Phone: "",
        Email: "",
        TaxID: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingCompany) {
            setFormData(editingCompany);
        } else {
            setFormData({
                CompanyName: "",
                Address: "",
                City: "",
                State: "",
                Country: "India",
                Phone: "",
                Email: "",
                TaxID: ""
            });
        }
        setErrors({});
    }, [editingCompany, show]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.CompanyName.trim()) {
            newErrors.CompanyName = "Company name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingCompany ? "Edit Company" : "Add New Company"}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Company Name *</label>
                        <input
                            type="text"
                            name="CompanyName"
                            value={formData.CompanyName}
                            onChange={handleChange}
                            placeholder="Enter company name"
                            className={errors.CompanyName ? "error" : ""}
                        />
                        {errors.CompanyName && <span className="error-text">{errors.CompanyName}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="Phone"
                                value={formData.Phone}
                                onChange={handleChange}
                                placeholder="Phone number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="Email"
                                value={formData.Email}
                                onChange={handleChange}
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="Address"
                            value={formData.Address}
                            onChange={handleChange}
                            placeholder="Street address"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="City"
                                value={formData.City}
                                onChange={handleChange}
                                placeholder="City"
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="State"
                                value={formData.State}
                                onChange={handleChange}
                                placeholder="State"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Country</label>
                            <input
                                type="text"
                                name="Country"
                                value={formData.Country}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Tax ID</label>
                            <input
                                type="text"
                                name="TaxID"
                                value={formData.TaxID}
                                onChange={handleChange}
                                placeholder="GST/Tax ID"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingCompany ? "Update Company" : "Create Company"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCompanyModal;
