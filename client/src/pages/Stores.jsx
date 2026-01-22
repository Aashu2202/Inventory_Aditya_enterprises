import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Warehouse, MapPin, Phone, ArrowLeftRight, Package, Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';
import TransferModal from '../components/TransferModal';
import '../styles/Stores.css';

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stockLoading, setStockLoading] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [currentStore, setCurrentStore] = useState(null);
    const [storeFormData, setStoreFormData] = useState({
        StoreName: '',
        Location: '',
        ContactNumber: ''
    });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/stores');
            setStores(response.data);
            if (response.data.length > 0 && !selectedStore) {
                handleStoreSelect(response.data[0]);
            } else if (selectedStore) {
                const updated = response.data.find(s => s.StoreId === selectedStore.StoreId);
                if (updated) setSelectedStore(updated);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSelect = async (store) => {
        setSelectedStore(store);
        setStockLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/stores/${store.StoreId}/inventory`);
            setInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setStockLoading(false);
        }
    };

    const handleOpenStoreModal = (store = null) => {
        if (store) {
            setCurrentStore(store);
            setStoreFormData({
                StoreName: store.StoreName,
                Location: store.Location,
                ContactNumber: store.ContactNumber || ''
            });
        } else {
            setCurrentStore(null);
            setStoreFormData({ StoreName: '', Location: '', ContactNumber: '' });
        }
        setIsStoreModalOpen(true);
    };

    const handleStoreSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentStore) {
                await axios.put(`http://localhost:5000/api/stores/${currentStore.StoreId}`, storeFormData);
            } else {
                await axios.post('http://localhost:5000/api/stores', storeFormData);
            }
            fetchStores();
            setIsStoreModalOpen(false);
        } catch (error) {
            console.error('Error saving store:', error);
            alert('Error saving store details.');
        }
    };

    const handleStoreDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this location? All linked inventory records will be affected.')) {
            try {
                await axios.delete(`http://localhost:5000/api/stores/${id}`);
                if (selectedStore?.StoreId === id) setSelectedStore(null);
                fetchStores();
            } catch (error) {
                console.error('Error deleting store:', error);
                alert('Could not delete store. It might have active inventory or transactions.');
            }
        }
    };

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading stores...</span></div>;

    return (
        <div className="stores-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Multi-Store Inventory</h1>
                    <p>Track stock levels across different locations</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn" onClick={() => handleOpenStoreModal()}>
                        <Plus size={18} />
                        <span>Add Store</span>
                    </button>
                    <button className="secondary-btn" onClick={() => setIsTransferModalOpen(true)}>
                        <ArrowLeftRight size={18} />
                        <span>Stock Transfer</span>
                    </button>
                </div>
            </div>

            <div className="stores-grid">
                <div className="stores-list-card">
                    <h3>Locations</h3>
                    <div className="store-items">
                        {stores.map((store) => (
                            <div
                                key={store.StoreId}
                                className={`store-item ${selectedStore?.StoreId === store.StoreId ? 'active' : ''}`}
                                onClick={() => handleStoreSelect(store)}
                            >
                                <div className="store-icon">
                                    <Warehouse size={20} />
                                </div>
                                <div className="store-details">
                                    <span className="store-name">{store.StoreName}</span>
                                    <div className="store-meta">
                                        <span className="location"><MapPin size={12} /> {store.Location}</span>
                                    </div>
                                </div>
                                <div className="store-actions">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenStoreModal(store); }} className="icon-btn-sm"><Edit2 size={14} /></button>
                                    <button onClick={(e) => handleStoreDelete(store.StoreId, e)} className="icon-btn-sm delete"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="inventory-details-card">
                    {selectedStore ? (
                        <>
                            <div className="card-header">
                                <h3>Stock at {selectedStore.StoreName}</h3>
                                <span className="item-count">{inventory.length} Products</span>
                            </div>

                            <div className="inventory-table-wrapper">
                                {stockLoading ? (
                                    <div className="table-loader">Fetching stock levels...</div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Category</th>
                                                <th>Stock Quantity</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inventory.length > 0 ? inventory.map((item) => (
                                                <tr key={item.InventoryId}>
                                                    <td>
                                                        <div className="product-table-cell">
                                                            <span className="p-name">{item.ProductName}</span>
                                                            <span className="p-barcode">{item.Barcode}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="cat-badge">{item.CategoryName}</span></td>
                                                    <td className="qty-cell">{item.Quantity}</td>
                                                    <td>
                                                        <span className={`status-pill ${item.Quantity > 10 ? 'success' : 'warning'}`}>
                                                            {item.Quantity > 10 ? 'Healthy' : 'Low Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="empty-state">No stock found in this location.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state select-store">
                            <Warehouse size={48} />
                            <p>Select a store to view its inventory</p>
                        </div>
                    )}
                </div>
            </div>

            {isStoreModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentStore ? 'Edit Store' : 'Add New Store'}</h2>
                            <button onClick={() => setIsStoreModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleStoreSubmit} className="modal-form">
                            <div className="form-group full-width">
                                <label>Store Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={storeFormData.StoreName}
                                    onChange={(e) => setStoreFormData({ ...storeFormData, StoreName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Location / Address <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={storeFormData.Location}
                                    onChange={(e) => setStoreFormData({ ...storeFormData, Location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    value={storeFormData.ContactNumber}
                                    onChange={(e) => setStoreFormData({ ...storeFormData, ContactNumber: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsStoreModalOpen(false)} className="secondary-btn">Cancel</button>
                                <button type="submit" className="primary-btn">{currentStore ? 'Update Store' : 'Create Store'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onTransferComplete={() => {
                    if (selectedStore) handleStoreSelect(selectedStore);
                }}
            />
        </div>
    );
};

export default Stores;
