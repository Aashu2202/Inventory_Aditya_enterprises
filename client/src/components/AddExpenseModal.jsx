import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, IndianRupee, Tag, FileText, Landmark, Calendar } from 'lucide-react';
import '../styles/Modals.css';

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded }) => {
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        Category: '',
        Amount: '',
        Description: '',
        AccountID: '',
        ExpenseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
        }
    }, [isOpen]);

    const fetchAccounts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/accounts');
            setAccounts(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, AccountID: res.data[0].AccountID }));
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/expenses', formData);
            onExpenseAdded();
            onClose();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Error saving expense details.');
        }
    };

    if (!isOpen) return null;

    const expenseCategories = ['Hammali', 'Chai/Snacks', 'Petrol/Fuel', 'Electricity', 'Rent', 'Stationery', 'Other'];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Record New Expense</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Expense Category <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Tag size={18} />
                                <select
                                    value={formData.Category}
                                    onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    <option value="Custom">Custom...</option>
                                </select>
                            </div>
                        </div>

                        {formData.Category === 'Custom' && (
                            <div className="form-group">
                                <label>Custom Category Name</label>
                                <div className="input-with-icon">
                                    <Tag size={18} />
                                    <input
                                        type="text"
                                        placeholder="Enter category name"
                                        onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Amount (₹) <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <IndianRupee size={18} />
                                <input
                                    type="number"
                                    value={formData.Amount}
                                    onChange={(e) => setFormData({ ...formData, Amount: e.target.value })}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Paid From <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Landmark size={18} />
                                <select
                                    value={formData.AccountID}
                                    onChange={(e) => setFormData({ ...formData, AccountID: e.target.value })}
                                    required
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => (
                                        <option key={acc.AccountID} value={acc.AccountID}>
                                            {acc.AccountName} (₹{acc.Balance})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>
                            <div className="input-with-icon">
                                <Calendar size={18} />
                                <input
                                    type="date"
                                    value={formData.ExpenseDate}
                                    onChange={(e) => setFormData({ ...formData, ExpenseDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Description / Remarks</label>
                            <div className="input-with-icon">
                                <FileText size={18} />
                                <textarea
                                    value={formData.Description}
                                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                    placeholder="Add details about the expense..."
                                    rows="2"
                                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '10px 40px' }}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="primary-btn">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
