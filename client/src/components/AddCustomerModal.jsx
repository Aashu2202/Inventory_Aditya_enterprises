import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, User, Phone, Mail, MapPin, Hash, Globe } from 'lucide-react';
import '../styles/Modals.css';

const AddCustomerModal = ({ isOpen, onClose, onCustomerAdded, initialData = null }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        CompanyName: '',
        Phone: '',
        Email: '',
        GSTIN: '',
        Address: '',
        City: '',
        State: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                setIsEdit(true);
            } else {
                setIsEdit(false);
                setFormData({
                    CompanyName: '',
                    Phone: '',
                    Email: '',
                    GSTIN: '',
                    Address: '',
                    City: '',
                    State: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (isEdit) {
                response = await axios.put(`http://localhost:5000/api/customers/${initialData.CustomerID}`, formData);
            } else {
                response = await axios.post('http://localhost:5000/api/customers', formData);
            }
            onCustomerAdded(response.data.id || initialData?.CustomerID);
            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Error saving customer details.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Customer/Company Name <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Building2 size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp or John Doe"
                                    value={formData.CompanyName}
                                    onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="input-with-icon">
                                <Phone size={18} />
                                <input
                                    type="text"
                                    value={formData.Phone}
                                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                                    placeholder="Enter contact number"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email ID</label>
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    value={formData.Email}
                                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                    placeholder="customer@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>GSTIN</label>
                            <div className="input-with-icon">
                                <Hash size={18} />
                                <input
                                    type="text"
                                    value={formData.GSTIN}
                                    onChange={(e) => setFormData({ ...formData, GSTIN: e.target.value })}
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <div className="input-with-icon">
                                <Globe size={18} />
                                <input
                                    type="text"
                                    value={formData.City}
                                    onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                                    placeholder="e.g. Mumbai"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>State</label>
                            <div className="input-with-icon">
                                <Globe size={18} />
                                <input
                                    type="text"
                                    value={formData.State}
                                    onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                                    placeholder="e.g. Maharashtra"
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Address</label>
                            <div className="input-with-icon">
                                <MapPin size={18} />
                                <textarea
                                    value={formData.Address}
                                    onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                    placeholder="Complete billing address"
                                    rows="2"
                                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '10px 0' }}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="primary-btn">{isEdit ? 'Update Customer' : 'Save Customer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;
