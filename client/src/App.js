import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import Warehouses from './pages/Warehouses';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Transfers from './pages/Transfers';
import Backup from './pages/Backup';
import PurchaseOrders from './pages/PurchaseOrders';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Companies from './pages/Companies';
import Bills from './pages/Bills';
import Layout from './components/Layout';

const App = () => {
  // Simple check for persistent auth (can be improved with context/redux later)
  const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    if (!user) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />

        {/* Protected Routes */}
        {/* Core Inventory Management */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
        <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

        {/* Transactional */}
        <Route path="/purchases" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />

        {/* Company & Admin */}
        <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />

        {/* Legacy/Other */}
        <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
