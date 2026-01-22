import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Warehouse, MapPin, Phone, Loader2, Plus, Edit2, Trash2, X, Building, Package } from 'lucide-react';
import '../styles/Stores.css'; // Reusing Stores.css

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [formData, setFormData] = useState({
        WarehouseName: '',
        Address: '',
        City: '',
        State: '',
        Phone: ''
    });

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/warehouses');
            setWarehouses(response.data);
            if (response.data.length > 0 && !selectedWarehouse) {
                setSelectedWarehouse(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleWarehouseSelect = (warehouse) => {
        setSelectedWarehouse(warehouse);
        // Stock details will be expanded here using Inventory table queries
    };

    const handleOpenModal = (warehouse = null) => {
        if (warehouse) {
            setCurrentWarehouse(warehouse);
            setFormData(warehouse);
        } else {
            setCurrentWarehouse(null);
            setFormData({ WarehouseName: '', Address: '', City: '', State: '', Phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentWarehouse) {
                await axios.put(`http://localhost:5000/api/warehouses/${currentWarehouse.WarehouseID}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/warehouses', formData);
            }
            fetchWarehouses();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving warehouse:', error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/warehouses/${id}`);
                fetchWarehouses();
            } catch (error) {
                console.error('Error deleting warehouse:', error);
            }
        }
    };

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading warehouses...</span></div>;

    return (
        <div className="stores-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Warehouse Management</h1>
                    <p>Manage your storage locations and track stock</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add Warehouse</span>
                    </button>
                </div>
            </div>

            <div className="stores-grid">
                <div className="stores-list-card">
                    <h3>Warehouses</h3>
                    <div className="store-items">
                        {warehouses.map((w) => (
                            <div
                                key={w.WarehouseID}
                                className={`store-item ${selectedWarehouse?.WarehouseID === w.WarehouseID ? 'active' : ''}`}
                                onClick={() => handleWarehouseSelect(w)}
                            >
                                <div className="store-icon">
                                    <Building size={20} />
                                </div>
                                <div className="store-details">
                                    <span className="store-name">{w.WarehouseName}</span>
                                    <div className="store-meta">
                                        <span className="location"><MapPin size={12} /> {w.City}, {w.State}</span>
                                    </div>
                                </div>
                                <div className="store-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(w); }} className="icon-btn-sm"><Edit2 size={14} /></button>
                                    <button onClick={(e) => handleDelete(w.WarehouseID, e)} className="icon-btn-sm delete"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="inventory-details-card">
                    {selectedWarehouse ? (
                        <>
                            <div className="card-header">
                                <h3>Stock at {selectedWarehouse.WarehouseName}</h3>
                                <div className="warehouse-info-tags">
                                    <span><MapPin size={14} /> {selectedWarehouse.Address}</span>
                                    <span><Phone size={14} /> {selectedWarehouse.Phone}</span>
                                </div>
                            </div>
                            <div className="empty-state">
                                <Package size={48} />
                                <p>Stock level monitoring currently being integrated...</p>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state select-store">
                            <Warehouse size={48} />
                            <p>Select a warehouse to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group full-width">
                                <label>Warehouse Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={formData.WarehouseName}
                                    onChange={(e) => setFormData({ ...formData, WarehouseName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        value={formData.City}
                                        onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={formData.State}
                                        onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.Phone}
                                        onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
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
                                <button type="submit" className="primary-btn">{currentWarehouse ? 'Update Warehouse' : 'Create Warehouse'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Warehouses;
