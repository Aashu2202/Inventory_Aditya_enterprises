import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Package, Hash, User } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import '../styles/Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [prodRes, supRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products'),
                axios.get('http://localhost:5000/api/suppliers')
            ]);
            setProducts(prodRes.data);
            setSuppliers(supRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`);
                fetchInitialData();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product.');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const getSupplierName = (id) => {
        const sup = suppliers.find(s => s.SupplierID === id);
        return sup ? sup.CompanyName : 'Unknown';
    };

    const filteredProducts = products.filter(p =>
        p.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.HSNCode && p.HSNCode.includes(searchTerm))
    );

    return (
        <div className="products-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Product Catalog</h1>
                    <p>Manage your items, HSN codes, and pricing</p>
                </div>
                <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="table-controls">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or HSN code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="products-card">
                {loading ? (
                    <div className="table-loader">Loading catalog...</div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product Details</th>
                                    <th>HSN Code</th>
                                    <th>Category</th>
                                    <th>Retail Price</th>
                                    <th>Wholesale Price</th>
                                    <th>Supplier</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.ProductID}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-icon">
                                                    <Package size={18} />
                                                </div>
                                                <div className="product-info">
                                                    <span className="product-name">{product.ProductName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={14} color="#94a3b8" /> {product.HSNCode || 'N/A'}</div></td>
                                        <td><span className="category-badge">{product.CategoryName || 'General'}</span></td>
                                        <td>
                                            <div className="price-cell">
                                                <span className="retail">₹{product.RetailPrice || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="price-cell">
                                                <span className="wholesale">₹{product.WholesalePrice || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} color="#94a3b8" /> {getSupplierName(product.SupplierID)}</div></td>
                                        <td>
                                            <div className="action-btns">
                                                <button title="Edit" className="icon-btn" onClick={() => handleEdit(product)}><Edit2 size={16} /></button>
                                                <button title="Delete" className="icon-btn delete" onClick={() => handleDelete(product.ProductID)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddProductModal
                isOpen={isModalOpen}
                initialData={selectedProduct}
                onClose={handleCloseModal}
                onProductAdded={fetchInitialData}
            />
        </div>
    );
};

export default Products;
