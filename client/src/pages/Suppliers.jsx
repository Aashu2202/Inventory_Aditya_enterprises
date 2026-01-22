import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Building2,
    Edit3,
    Trash2,
    Loader2,
    X,
    User,
    Hash,
    Globe
} from 'lucide-react';
import '../styles/Vendors.css';
import '../styles/Modals.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [formData, setFormData] = useState({
        CompanyName: '',
        ContactName: '',
        Phone: '',
        Email: '',
        GSTIN: '',
        Address: '',
        City: '',
        State: '',
        Country: 'India'
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setCurrentSupplier(supplier);
            setFormData(supplier);
        } else {
            setCurrentSupplier(null);
            setFormData({
                CompanyName: '',
                ContactName: '',
                Phone: '',
                Email: '',
                GSTIN: '',
                Address: '',
                City: '',
                State: '',
                Country: 'India'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentSupplier) {
                await axios.put(`http://localhost:5000/api/suppliers/${currentSupplier.SupplierID}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/suppliers', formData);
            }
            fetchSuppliers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Error saving supplier details.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
                fetchSuppliers();
            } catch (error) {
                console.error('Error deleting supplier:', error);
            }
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.ContactName && s.ContactName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading suppliers...</span></div>;

    return (
        <div className="vendors-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Supplier Management</h1>
                    <p>Manage your procurement partners and contacts</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            <div className="vendors-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by company or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="vendors-grid">
                {filteredSuppliers.map((supplier) => (
                    <div key={supplier.SupplierID} className="vendor-card">
                        <div className="vendor-card-header">
                            <div className="vendor-avatar">
                                <Building2 size={24} />
                            </div>
                            <div className="vendor-main-info">
                                <h3>{supplier.CompanyName}</h3>
                                <span className="contact-person">{supplier.ContactName}</span>
                            </div>
                            <div className="vendor-actions">
                                <button onClick={() => handleOpenModal(supplier)} className="icon-btn"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(supplier.SupplierID)} className="icon-btn delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="vendor-body">
                            <div className="info-item">
                                <Phone size={14} />
                                <span>{supplier.Phone}</span>
                            </div>
                            <div className="info-item">
                                <Mail size={14} />
                                <span>{supplier.Email}</span>
                            </div>
                            <div className="info-item">
                                <MapPin size={14} />
                                <span>{supplier.Address}, {supplier.City}</span>
                            </div>
                            {supplier.GSTIN && (
                                <div className="gst-tag">
                                    GSTIN: {supplier.GSTIN}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Company Name <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <Building2 size={18} />
                                        <input
                                            type="text"
                                            value={formData.CompanyName}
                                            onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
                                            required
                                            placeholder="e.g. Reliance Industries"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <div className="input-with-icon">
                                        <User size={18} />
                                        <input
                                            type="text"
                                            value={formData.ContactName}
                                            onChange={(e) => setFormData({ ...formData, ContactName: e.target.value })}
                                            placeholder="e.g. Rajesh Kumar"
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
                                            placeholder="Enter phone"
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
                                            placeholder="supplier@example.com"
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
                                            placeholder="GST Number"
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
                                            placeholder="City"
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
                                            placeholder="State"
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
                                            rows="2"
                                            placeholder="Full address"
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '10px 0' }}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                                <button type="submit" className="primary-btn">{currentSupplier ? 'Update Supplier' : 'Add Supplier'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
