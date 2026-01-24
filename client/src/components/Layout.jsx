import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CompanySelector from './CompanySelector';
import { User, Bell, Search, Menu, X, LogOut } from 'lucide-react';
import '../styles/Layout.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user')) || { Username: 'Guest', Role: 'User' };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
                onClose={() => setIsSidebarOpen(false)}
                onToggleCollapse={toggleCollapse}
            />

            <div className="main-wrapper">
                <header className="main-header">
                    <div className="header-left">
                        <button className="menu-toggle" onClick={toggleSidebar}>
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="search-bar">
                            <Search size={18} />
                            <input type="text" placeholder="Search anything..." />
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="company-selector-wrapper">
                            <CompanySelector />
                        </div>
                        <button className="icon-btn hide-mobile">
                            <Bell size={20} />
                            <span className="badge"></span>
                        </button>
                        <div className="user-profile-wrapper">
                            <div 
                                className="user-profile"
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            >
                                <div className="user-info hide-mobile">
                                    <span className="user-name">{user.Username}</span>
                                    <span className="user-role">{user.Role}</span>
                                </div>
                                <div className="user-avatar">
                                    <User size={20} />
                                </div>
                            </div>
                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown">
                                    <button onClick={handleLogout} className="dropdown-item logout-item">
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="main-content">
                    {children}
                </main>
            </div>
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
        </div>
    );
};

export default Layout;
