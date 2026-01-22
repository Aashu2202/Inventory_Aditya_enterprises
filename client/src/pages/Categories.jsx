import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, Edit2, Trash2, X, Loader2, FileText } from 'lucide-react';
import '../styles/Dashboard.css';
import '../styles/Modals.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ CategoryName: '', Description: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setCurrentCategory(cat);
            setFormData({ CategoryName: cat.CategoryName, Description: cat.Description || '' });
        } else {
            setCurrentCategory(null);
            setFormData({ CategoryName: '', Description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCategory) {
                await axios.put(`http://localhost:5000/api/categories/${currentCategory.CategoryID}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/categories', formData);
            }
            fetchCategories();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:5000/api/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    if (loading) return <div className="loader-container"><Loader2 className="spinning" /> <span>Loading categories...</span></div>;

    return (
        <div className="dashboard-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div className="header-info">
                    <h1 style={{ color: 'white' }}>Category Management</h1>
                    <p style={{ color: '#94a3b8' }}>Organize your products by category</p>
                </div>
                <button className="primary-btn" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    <span>Add Category</span>
                </button>
            </div>

            <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.CategoryID}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Tag size={16} color="#6366f1" />
                                            <span style={{ fontWeight: 600 }}>{cat.CategoryName}</span>
                                        </div>
                                    </td>
                                    <td>{cat.Description || 'No description'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleOpenModal(cat)} className="icon-btn" style={{ marginRight: '8px' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(cat.CategoryID)} className="icon-btn delete"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{currentCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Category Name <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <Tag size={18} />
                                        <input
                                            type="text"
                                            value={formData.CategoryName}
                                            onChange={(e) => setFormData({ ...formData, CategoryName: e.target.value })}
                                            required
                                            placeholder="e.g. Electricals"
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <div className="input-with-icon">
                                        <FileText size={18} />
                                        <textarea
                                            value={formData.Description}
                                            onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                                            placeholder="Optional category description"
                                            rows="3"
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '10px 0' }}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">Cancel</button>
                                <button type="submit" className="primary-btn">{currentCategory ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
