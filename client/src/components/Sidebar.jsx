import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    Users,
    Tag,
    ShoppingCart,
    ArrowLeftRight,
    FileText,
    TrendingUp,
    Database,
    ChevronLeft,
    ChevronRight,
    Wallet,
    Building,
    FileCheck
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Products', icon: <Package size={20} />, path: '/products' },
        { name: 'Categories', icon: <Tag size={20} />, path: '/categories' },
        { name: 'Suppliers', icon: <Users size={20} />, path: '/suppliers' },
        { name: 'Warehouses', icon: <Warehouse size={20} />, path: '/warehouses' },
        { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
        { name: 'Purchases', icon: <ShoppingCart size={20} />, path: '/purchases' },
        { name: 'Sales Orders', icon: <FileText size={20} />, path: '/orders' },
        { name: 'Bills & Invoices', icon: <FileCheck size={20} />, path: '/bills' },
        { name: 'Accounts', icon: <Wallet size={20} />, path: '/accounts' },
        { name: 'Transfers', icon: <ArrowLeftRight size={20} />, path: '/transfers' },
        { name: 'Companies', icon: <Building size={20} />, path: '/companies' },
        { name: 'Sales Reports', icon: <TrendingUp size={20} />, path: '/reports' },
        { name: 'Backup & Restore', icon: <Database size={20} />, path: '/backup' },
    ];

    return (
        <div className={`sidebar ${isOpen ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-icon">AE</div>
                {!isCollapsed && <span>Aditya Enterprises</span>}
            </div>

            <button className="collapse-btn hide-mobile" onClick={onToggleCollapse}>
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        title={isCollapsed ? item.name : ''}
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        onClick={() => window.innerWidth <= 768 && onClose()}
                    >
                        {item.icon}
                        {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
