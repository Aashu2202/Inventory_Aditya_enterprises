import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Building2,
    Edit3,
    Trash2,
    MoreVertical,
    Loader2,
    X
} from 'lucide-react';
import '../styles/Vendors.css';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVendor, setCurrentVendor] = useState(null);
    const [formData, setFormData] = useState({
        VendorName: '',
        ContactPerson: '',
        Phone: '',
        Email: '',
        Address: '',
        GSTIN: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/vendors');
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (vendor = null) => {
        if (vendor) {
            setCurrentVendor(vendor);
            setFormData(vendor);
        } else {
            setCurrentVendor(null);
            setFormData({
                VendorName: '',
                ContactPerson: '',
                Phone: '',
                Email: '',
                Address: '',
                GSTIN: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentVendor) {
                await axios.put(`http://localhost:5000/api/vendors/${currentVendor.VendorId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/vendors', formData);
            }
            fetchVendors();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving vendor:', error);
            alert('Error saving vendor details.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this supplier?')) {
            try {
                await axios.delete(`http://localhost:5000/api/vendors/${id}`);
                fetchVendors();
            } catch (error) {
                console.error('Error deleting vendor:', error);
                alert('Could not delete vendor. They might be linked to existing orders.');
            }
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.VendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ContactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading suppliers...</span></div>;

    return (
        <div className="vendors-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Vendor Management</h1>
                    <p>Manage your suppliers and procurement contacts</p>
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
                        placeholder="Search by vendor or contact name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="vendors-grid">
                {filteredVendors.map((vendor) => (
                    <div key={vendor.VendorId} className="vendor-card">
                        <div className="vendor-card-header">
                            <div className="vendor-avatar">
                                <Building2 size={24} />
                            </div>
                            <div className="vendor-main-info">
                                <h3>{vendor.VendorName}</h3>
                                <span className="contact-person">{vendor.ContactPerson}</span>
                            </div>
                            <div className="vendor-actions">
                                <button onClick={() => handleOpenModal(vendor)} className="icon-btn"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(vendor.VendorId)} className="icon-btn delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="vendor-body">
                            <div className="info-item">
                                <Phone size={14} />
                                <span>{vendor.Phone}</span>
                            </div>
                            <div className="info-item">
                                <Mail size={14} />
                                <span>{vendor.Email}</span>
                            </div>
                            <div className="info-item">
                                <MapPin size={14} />
                                <span>{vendor.Address}</span>
                            </div>
                            {vendor.GSTIN && (
                                <div className="gst-tag">
                                    GSTIN: {vendor.GSTIN}
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
                            <h2>{currentVendor ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group full-width">
                                <label>Business Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={formData.VendorName}
                                    onChange={(e) => setFormData({ ...formData, VendorName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.ContactPerson}
                                        onChange={(e) => setFormData({ ...formData, ContactPerson: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.Phone}
                                        onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.Email}
                                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>GSTIN</label>
                                    <input
                                        type="text"
                                        value={formData.GSTIN}
                                        onChange={(e) => setFormData({ ...formData, GSTIN: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea
                                    value={formData.Address}
                                    onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                                <button type="submit" className="primary-btn">
                                    {currentVendor ? 'Update Supplier' : 'Add Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
