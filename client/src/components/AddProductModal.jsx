import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Barcode, Hash, Tag, IndianRupee, Package, User } from 'lucide-react';
import '../styles/Modals.css';

const AddProductModal = ({ isOpen, onClose, onProductAdded, initialData = null }) => {
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        ProductName: '',
        CategoryID: '',
        HSNCode: '',
        UnitPrice: '', // Legacy field for compatibility
        RetailPrice: '',
        WholesalePrice: '',
        SupplierID: '',
        Barcode: '' // Initial barcode
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            if (initialData) {
                setFormData({
                    ProductName: initialData.ProductName,
                    CategoryID: initialData.CategoryID,
                    HSNCode: initialData.HSNCode || '',
                    UnitPrice: initialData.UnitPrice,
                    RetailPrice: initialData.RetailPrice || '',
                    WholesalePrice: initialData.WholesalePrice || '',
                    SupplierID: initialData.SupplierID,
                    Barcode: initialData.Barcode || '' // If provided from view
                });
                setIsEdit(true);
            } else {
                setIsEdit(false);
                setFormData({
                    ProductName: '',
                    CategoryID: '',
                    HSNCode: '',
                    UnitPrice: '',
                    RetailPrice: '',
                    WholesalePrice: '',
                    SupplierID: '',
                    Barcode: ''
                });
            }
        }
    }, [isOpen, initialData]);

    const fetchInitialData = async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                axios.get('http://localhost:5000/api/categories'),
                axios.get('http://localhost:5000/api/suppliers')
            ]);
            setCategories(catRes.data);
            setSuppliers(supRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const generateBarcode = () => {
        const timestamp = Date.now().toString().slice(-10);
        return `890${timestamp}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure UnitPrice is set (default to RetailPrice for backward compatibility)
            const dataToSubmit = {
                ...formData,
                UnitPrice: formData.UnitPrice || formData.RetailPrice || formData.WholesalePrice
            };

            if (isEdit) {
                // For edit, we update the product table
                await axios.put(`http://localhost:5000/api/products/${initialData.ProductID}`, dataToSubmit);
            } else {
                // For new, we create product + initial barcode
                await axios.post('http://localhost:5000/api/products', dataToSubmit);
            }
            onProductAdded();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product details.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Product Name <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Package size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Syska LED Bulb 9W"
                                    value={formData.ProductName}
                                    onChange={(e) => setFormData({ ...formData, ProductName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>HSN Code</label>
                            <div className="input-with-icon">
                                <Hash size={18} />
                                <input
                                    type="text"
                                    value={formData.HSNCode}
                                    onChange={(e) => setFormData({ ...formData, HSNCode: e.target.value })}
                                    placeholder="e.g. 8539"
                                />
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="form-group">
                                <label>Barcode / EAN</label>
                                <div className="input-with-icon">
                                    <Barcode size={18} />
                                    <input
                                        type="text"
                                        value={formData.Barcode}
                                        onChange={(e) => setFormData({ ...formData, Barcode: e.target.value })}
                                        placeholder="Scan or auto-gen"
                                    />
                                    <button
                                        type="button"
                                        className="auto-gen-btn"
                                        onClick={() => setFormData({ ...formData, Barcode: generateBarcode() })}
                                    >
                                        Auto
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Category <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <Tag size={18} />
                                <select
                                    value={formData.CategoryID}
                                    onChange={(e) => setFormData({ ...formData, CategoryID: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Primary Supplier <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <User size={18} />
                                <select
                                    value={formData.SupplierID}
                                    onChange={(e) => setFormData({ ...formData, SupplierID: e.target.value })}
                                    required
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s.SupplierID} value={s.SupplierID}>{s.CompanyName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Retail Price <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <IndianRupee size={18} />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 299.99"
                                    value={formData.RetailPrice}
                                    onChange={(e) => setFormData({ ...formData, RetailPrice: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Wholesale Price <span className="required">*</span></label>
                            <div className="input-with-icon">
                                <IndianRupee size={18} />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 249.99"
                                    value={formData.WholesalePrice}
                                    onChange={(e) => setFormData({ ...formData, WholesalePrice: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="primary-btn">{isEdit ? 'Update Product' : 'Save Product'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
