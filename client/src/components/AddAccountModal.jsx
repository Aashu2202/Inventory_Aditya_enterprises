import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Landmark, Wallet, CreditCard } from 'lucide-react';
import '../styles/Modals.css';

const AddAccountModal = ({ isOpen, onClose, onAccountAdded }) => {
    const [formData, setFormData] = useState({
        AccountName: '',
        AccountType: 'CASH',
        Balance: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/accounts', formData);
            onAccountAdded();
            onClose();
        } catch (error) {
            console.error('Error saving account:', error);
            alert('Error saving account details.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Account</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Account Name <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <CreditCard size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. HDFC Bank, Petty Cash"
                                    value={formData.AccountName}
                                    onChange={(e) => setFormData({ ...formData, AccountName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Account Type <span className="required">*</span></label>
                            <div className="input-with-icon">
                                {formData.AccountType === 'CASH' ? <Wallet size={18} /> : <Landmark size={18} />}
                                <select
                                    value={formData.AccountType}
                                    onChange={(e) => setFormData({ ...formData, AccountType: e.target.value })}
                                    required
                                >
                                    <option value="CASH">Cash Account</option>
                                    <option value="BANK">Bank Account</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Initial Balance (₹)</label>
                            <div className="input-with-icon">
                                <span style={{ position: 'absolute', left: '14px', color: '#64748b', fontSize: '14px' }}>₹</span>
                                <input
                                    type="number"
                                    value={formData.Balance}
                                    onChange={(e) => setFormData({ ...formData, Balance: e.target.value })}
                                    placeholder="0.00"
                                    style={{ paddingLeft: '30px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="primary-btn">Create Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAccountModal;
