import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Wallet,
    Landmark,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    History,
    Loader2,
    Search,
    IndianRupee,
    Briefcase,
    PlusCircle
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import AddAccountModal from '../components/AddAccountModal';
import '../styles/Dashboard.css';

const Accounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpModalOpen, setIsExpModalOpen] = useState(false);
    const [isAccModalOpen, setIsAccModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accRes, expRes] = await Promise.all([
                axios.get('http://localhost:5000/api/accounts'),
                axios.get('http://localhost:5000/api/expenses')
            ]);
            setAccounts(accRes.data);
            setExpenses(expRes.data);
        } catch (error) {
            console.error('Error fetching account data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExpenses = expenses.filter(e =>
        e.Category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.Description && e.Description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading accounts...</span></div>;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.Balance), 0);

    return (
        <div className="dashboard-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div className="header-info">
                    <h1 style={{ color: 'white' }}>Accounts & Expenses</h1>
                    <p style={{ color: '#94a3b8' }}>Manage your cash, bank balances and daily expenses</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="secondary-btn" onClick={() => setIsAccModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={18} />
                        <span>Add Account</span>
                    </button>
                    <button className="primary-btn" onClick={() => setIsExpModalOpen(true)}>
                        <Plus size={18} />
                        <span>Record Expense</span>
                    </button>
                </div>
            </div>

            {/* Account Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)' }}><Briefcase color="white" /></div>
                    <div className="stat-info">
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Liquidity</span>
                        <h2 style={{ color: 'white' }}>₹{totalBalance.toLocaleString()}</h2>
                    </div>
                </div>

                {accounts.map(acc => (
                    <div key={acc.AccountID} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="stat-icon" style={{ background: acc.AccountType === 'CASH' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)' }}>
                            {acc.AccountType === 'CASH' ? <Wallet color="#22c55e" /> : <Landmark color="#3b82f6" />}
                        </div>
                        <div className="stat-info">
                            <span style={{ color: '#94a3b8' }}>{acc.AccountName}</span>
                            <h2 style={{ color: 'white' }}>₹{parseFloat(acc.Balance).toLocaleString()}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <History size={20} color="#6366f1" />
                        <h3 style={{ color: 'white', margin: 0 }}>Recent Expenses</h3>
                    </div>
                    <div className="search-box" style={{ maxWidth: '300px' }}>
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Paid From</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.length > 0 ? filteredExpenses.map((exp) => (
                                <tr key={exp.ExpenseID}>
                                    <td style={{ color: '#94a3b8' }}>{new Date(exp.ExpenseDate).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: '#818cf8',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            {exp.Category}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
                                            {exp.AccountName}
                                        </div>
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '14px' }}>{exp.Description || '-'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#f87171' }}>
                                        - ₹{parseFloat(exp.Amount).toLocaleString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No expenses found. Click "Record Expense" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isExpModalOpen}
                onClose={() => setIsExpModalOpen(false)}
                onExpenseAdded={fetchData}
            />

            <AddAccountModal
                isOpen={isAccModalOpen}
                onClose={() => setIsAccModalOpen(false)}
                onAccountAdded={fetchData}
            />
        </div>
    );
};

export default Accounts;
