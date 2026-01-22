import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Edit3,
    Trash2,
    Loader2
} from 'lucide-react';
import AddCustomerModal from '../components/AddCustomerModal';
import '../styles/Vendors.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (customer = null) => {
        setCurrentCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this customer?')) {
            try {
                await axios.delete(`http://localhost:5000/api/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('Could not delete customer.');
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.Phone && c.Phone.includes(searchTerm))
    );

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading customers...</span></div>;

    return (
        <div className="vendors-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Customer Management</h1>
                    <p>Manage your client database and contact information</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="vendors-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by company or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="vendors-grid">
                {filteredCustomers.map((customer) => (
                    <div key={customer.CustomerID} className="vendor-card">
                        <div className="vendor-card-header">
                            <div className="vendor-avatar">
                                <Users size={24} />
                            </div>
                            <div className="vendor-main-info">
                                <h3>{customer.CompanyName}</h3>
                                <span className="contact-person">{customer.City}, {customer.State}</span>
                            </div>
                            <div className="vendor-actions">
                                <button onClick={() => handleOpenModal(customer)} className="icon-btn"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(customer.CustomerID)} className="icon-btn delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="vendor-body">
                            <div className="info-item">
                                <Phone size={14} />
                                <span>{customer.Phone || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <Mail size={14} />
                                <span>{customer.Email || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <MapPin size={14} />
                                <span>{customer.Address}</span>
                            </div>
                            {customer.GSTIN && (
                                <div className="gst-tag">
                                    GSTIN: {customer.GSTIN}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCustomerAdded={fetchCustomers}
                initialData={currentCustomer}
            />
        </div>
    );
};

export default Customers;
