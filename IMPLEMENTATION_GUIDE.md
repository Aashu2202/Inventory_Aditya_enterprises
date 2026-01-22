# Implementation Guide - Multi-Company & Financial Year Management

## Overview
This guide explains how to integrate the new multi-company and financial year management features into your existing application.

---

## STEP 1: Database Setup

### 1.1 Backup Current Database
```bash
# Backup existing database
mysqldump -u root -p inventory_db > backup_before_v4.sql
```

### 1.2 Run Migration Script
```bash
# Execute the new schema
mysql -u root -p inventory_db < server/inventory_v4.sql
```

### 1.3 Migrate Existing Data (Optional)
If you want to keep your existing data:

```sql
-- 1. Create default company for existing data
INSERT INTO Companies (CompanyName, GSTIN, LegalName, Email, Phone, Address, City, State)
VALUES (
    'Your Company Name',
    'YOUR_GSTIN_NUMBER',
    'Your Legal Company Name',
    'email@company.com',
    'phone_number',
    'Address',
    'City',
    'State'
);

-- 2. Get the inserted company ID (note the ID)
SELECT LAST_INSERT_ID() as CompanyID;

-- 3. Update Categories table (replace 1 with your CompanyID)
UPDATE Categories SET CompanyID = 1;

-- 4. Update Suppliers table
UPDATE Suppliers SET CompanyID = 1;

-- 5. Update Warehouses table
UPDATE Warehouses SET CompanyID = 1;

-- 6. Create Financial Year for current data
INSERT INTO FinancialYears (CompanyID, FYName, StartDate, EndDate)
VALUES (1, '2024-2025', '2024-04-01', '2025-03-31');

-- 7. Get the inserted FY ID (note the ID)
SELECT LAST_INSERT_ID() as FinancialYearID;

-- 8. Update Products table (replace 1 with CompanyID and FinancialYearID)
UPDATE Products SET CompanyID = 1, FinancialYearID = 1;

-- 9. Update Inventory table
UPDATE Inventory SET CompanyID = 1, FinancialYearID = 1;

-- 10. Update Customers table
UPDATE Customers SET CompanyID = 1;

-- 11. Update Purchases table
UPDATE Purchases SET CompanyID = 1, FinancialYearID = 1;

-- 12. Update Orders table
UPDATE Orders SET CompanyID = 1, FinancialYearID = 1;

-- 13. Update StockMovements table
UPDATE StockMovements SET CompanyID = 1, FinancialYearID = 1;

-- 14. Update Expenses table
UPDATE Expenses SET CompanyID = 1, FinancialYearID = 1;

-- 15. Update Accounts table
UPDATE Accounts SET CompanyID = 1;
```

---

## STEP 2: Server Integration

### 2.1 Update main server file (index.js)

Add the new routes to your Express app:

```javascript
// In server/index.js

const express = require('express');
const app = express();

// Existing routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));

// NEW ROUTES - Add these
app.use('/api/companies', require('./routes/company.routes'));
app.use('/api/financial-years', require('./routes/financialYear.routes'));
app.use('/api/access-tokens', require('./routes/accessToken.routes'));
app.use('/api/fy-transfer', require('./routes/fyTransfer.routes'));

// Rest of your code...
```

### 2.2 Update Existing Controllers

All existing controllers need to be updated to filter by CompanyID and FinancialYearID.

Example for Product Controller:

**OLD CODE:**
```javascript
const getAllProducts = (req, res) => {
    const query = "SELECT * FROM Products";
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
};
```

**NEW CODE:**
```javascript
const getAllProducts = (req, res) => {
    const { companyId, financialYearId } = req.params;
    const query = "SELECT * FROM Products WHERE CompanyID = ? AND FinancialYearID = ?";
    db.query(query, [companyId, financialYearId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err });
        }
        res.json({ success: true, data: results });
    });
};
```

### 2.3 Create Authentication Middleware

Create a middleware to verify tokens and set userId:

```javascript
// Create file: server/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const AccessToken = require('../models/accessToken.model');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify JWT token (or your auth mechanism)
    try {
        // Assuming you use JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.companyId = decoded.companyId;
        
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
```

### 2.4 Use Middleware in Routes

```javascript
// In your route files
const authMiddleware = require('../middleware/auth.middleware');

router.post('/generate', authMiddleware, AccessTokenController.generateToken);
```

---

## STEP 3: Update Client UI

### 3.1 Add Company Selection Component

Create a company selector component:

```jsx
// client/src/components/CompanySelector.jsx

import React, { useState, useEffect } from 'react';

function CompanySelector() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/companies');
            const data = await response.json();
            setCompanies(data.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleCompanyChange = (companyId) => {
        setSelectedCompany(companyId);
        // Store in localStorage or context
        localStorage.setItem('selectedCompanyId', companyId);
    };

    return (
        <div className="company-selector">
            <label>Select Company:</label>
            <select 
                value={selectedCompany || ''} 
                onChange={(e) => handleCompanyChange(e.target.value)}
            >
                <option value="">-- Select a Company --</option>
                {companies.map(company => (
                    <option key={company.CompanyID} value={company.CompanyID}>
                        {company.CompanyName}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CompanySelector;
```

### 3.2 Add Financial Year Selector

```jsx
// client/src/components/FinancialYearSelector.jsx

import React, { useState, useEffect } from 'react';

function FinancialYearSelector({ companyId }) {
    const [financialYears, setFinancialYears] = useState([]);
    const [selectedFY, setSelectedFY] = useState(null);

    useEffect(() => {
        if (companyId) {
            fetchFinancialYears();
        }
    }, [companyId]);

    const fetchFinancialYears = async () => {
        try {
            const response = await fetch(`/api/financial-years/company/${companyId}`);
            const data = await response.json();
            setFinancialYears(data.data);
        } catch (error) {
            console.error('Error fetching financial years:', error);
        }
    };

    const handleFYChange = (fyId) => {
        setSelectedFY(fyId);
        localStorage.setItem('selectedFinancialYearId', fyId);
    };

    return (
        <div className="fy-selector">
            <label>Select Financial Year:</label>
            <select 
                value={selectedFY || ''} 
                onChange={(e) => handleFYChange(e.target.value)}
                disabled={!companyId}
            >
                <option value="">-- Select a Financial Year --</option>
                {financialYears.map(fy => (
                    <option key={fy.FinancialYearID} value={fy.FinancialYearID}>
                        {fy.FYName} ({fy.Status})
                    </option>
                ))}
            </select>
        </div>
    );
}

export default FinancialYearSelector;
```

### 3.3 Add Company Management Page

Create a new page for company management:

```jsx
// client/src/pages/Companies.jsx

import React, { useState, useEffect } from 'react';
import '../styles/Companies.css';

function Companies() {
    const [companies, setCompanies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        legalName: '',
        gstin: '',
        pan: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/companies');
            const data = await response.json();
            if (data.success) {
                setCompanies(data.data);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/companies/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                alert('Company created successfully!');
                setShowForm(false);
                fetchCompanies();
                setFormData({
                    companyName: '',
                    legalName: '',
                    gstin: '',
                    pan: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: ''
                });
            }
        } catch (error) {
            console.error('Error creating company:', error);
            alert('Error creating company');
        }
    };

    return (
        <div className="companies-page">
            <h1>Company Management</h1>
            
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancel' : '+ Add New Company'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="company-form">
                    <div className="form-group">
                        <label>Company Name *</label>
                        <input 
                            type="text" 
                            value={formData.companyName}
                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>GSTIN *</label>
                        <input 
                            type="text" 
                            value={formData.gstin}
                            onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Legal Name</label>
                        <input 
                            type="text" 
                            value={formData.legalName}
                            onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>PAN</label>
                        <input 
                            type="text" 
                            value={formData.pan}
                            onChange={(e) => setFormData({...formData, pan: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>City</label>
                        <input 
                            type="text" 
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>State</label>
                        <input 
                            type="text" 
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="btn-primary">Create Company</button>
                </form>
            )}

            <div className="companies-list">
                <h2>Companies</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>GSTIN</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(company => (
                            <tr key={company.CompanyID}>
                                <td>{company.CompanyName}</td>
                                <td>{company.GSTIN}</td>
                                <td>{company.Email}</td>
                                <td>{company.Phone}</td>
                                <td>{company.City}</td>
                                <td>{company.State}</td>
                                <td>{company.IsActive ? 'Active' : 'Inactive'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Companies;
```

### 3.4 Add Financial Year Transfer Page

```jsx
// client/src/pages/YearEndTransfer.jsx

import React, { useState, useEffect } from 'react';

function YearEndTransfer() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [financialYears, setFinancialYears] = useState([]);
    const [fromFY, setFromFY] = useState('');
    const [toFY, setToFY] = useState('');
    const [transferLogs, setTransferLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/companies');
            const data = await response.json();
            setCompanies(data.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleCompanyChange = async (companyId) => {
        setSelectedCompany(companyId);
        try {
            const response = await fetch(`/api/financial-years/company/${companyId}`);
            const data = await response.json();
            setFinancialYears(data.data);
            
            // Fetch transfer logs
            const logsResponse = await fetch(`/api/fy-transfer/company/${companyId}`);
            const logsData = await logsResponse.json();
            setTransferLogs(logsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInitiateTransfer = async () => {
        if (!selectedCompany || !fromFY || !toFY) {
            alert('Please select company and both financial years');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/fy-transfer/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: parseInt(selectedCompany),
                    fromFinancialYearId: parseInt(fromFY),
                    toFinancialYearId: parseInt(toFY),
                    description: 'Year-end financial year transfer'
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Transfer initiated successfully!');
                handleCompanyChange(selectedCompany);
            }
        } catch (error) {
            console.error('Error initiating transfer:', error);
            alert('Error initiating transfer');
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteTransfer = async (transferId) => {
        if (!window.confirm('Are you sure? This will transfer all master data to the new financial year.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/fy-transfer/${transferId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: parseInt(selectedCompany),
                    fromFinancialYearId: parseInt(fromFY),
                    toFinancialYearId: parseInt(toFY)
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Transfer executed successfully!');
                handleCompanyChange(selectedCompany);
            }
        } catch (error) {
            console.error('Error executing transfer:', error);
            alert('Error executing transfer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="year-end-transfer-page">
            <h1>Year-End Transfer</h1>

            <div className="transfer-section">
                <h2>Initiate Transfer</h2>
                
                <div className="form-group">
                    <label>Select Company:</label>
                    <select 
                        value={selectedCompany}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                    >
                        <option value="">-- Select Company --</option>
                        {companies.map(c => (
                            <option key={c.CompanyID} value={c.CompanyID}>
                                {c.CompanyName}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCompany && (
                    <>
                        <div className="form-group">
                            <label>From Financial Year:</label>
                            <select 
                                value={fromFY}
                                onChange={(e) => setFromFY(e.target.value)}
                            >
                                <option value="">-- Select FY --</option>
                                {financialYears.map(fy => (
                                    <option key={fy.FinancialYearID} value={fy.FinancialYearID}>
                                        {fy.FYName} ({fy.Status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>To Financial Year:</label>
                            <select 
                                value={toFY}
                                onChange={(e) => setToFY(e.target.value)}
                            >
                                <option value="">-- Select FY --</option>
                                {financialYears.map(fy => (
                                    <option key={fy.FinancialYearID} value={fy.FinancialYearID}>
                                        {fy.FYName} ({fy.Status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={handleInitiateTransfer}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Processing...' : 'Initiate Transfer'}
                        </button>
                    </>
                )}
            </div>

            <div className="transfer-logs-section">
                <h2>Transfer History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>From FY</th>
                            <th>To FY</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transferLogs.map(log => (
                            <tr key={log.TransferID}>
                                <td>{log.FromFYName || 'N/A'}</td>
                                <td>{log.ToFYName || 'N/A'}</td>
                                <td>
                                    <span className={`status ${log.Status.toLowerCase()}`}>
                                        {log.Status}
                                    </span>
                                </td>
                                <td>{new Date(log.TransferredDate).toLocaleDateString()}</td>
                                <td>
                                    {log.Status === 'Pending' && (
                                        <button 
                                            onClick={() => handleExecuteTransfer(log.TransferID)}
                                            disabled={loading}
                                            className="btn-small"
                                        >
                                            Execute
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default YearEndTransfer;
```

---

## STEP 4: Update API Calls in Existing Components

### Example: Update Products Page

**Before:**
```jsx
const fetchProducts = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
};
```

**After:**
```jsx
const fetchProducts = async () => {
    const companyId = localStorage.getItem('selectedCompanyId');
    const fyId = localStorage.getItem('selectedFinancialYearId');
    
    const response = await fetch(`/api/products/${companyId}/${fyId}`);
    const data = await response.json();
    setProducts(data.data);
};
```

---

## STEP 5: Environment Configuration

Add to your `.env` file:

```env
# Multi-company settings
DEFAULT_COMPANY_ID=1
ENABLE_MULTI_COMPANY=true
TOKEN_EXPIRY_DAYS=365

# JWT Secret for token validation
JWT_SECRET=your_secret_key_here
```

---

## STEP 6: Generate Invoice PDFs with Company Details

Update your PDF generation module:

```javascript
// In your invoice generation module
const generateInvoicePDF = async (orderId, companyId, fyId) => {
    // Fetch company details
    const company = await Company.getById(companyId);
    
    // Fetch order details
    const order = await Order.getById(orderId, fyId);
    
    // Generate PDF with company info
    const pdf = new PDFDocument();
    
    // Add company header
    pdf.fontSize(16).font('Helvetica-Bold').text(company.CompanyName, 50, 50);
    pdf.fontSize(10).font('Helvetica').text(`GSTIN: ${company.GSTIN}`, 50, 70);
    pdf.text(`PAN: ${company.PAN}`, 50, 85);
    pdf.text(`${company.Address}, ${company.City}, ${company.State}`, 50, 100);
    pdf.text(`Phone: ${company.Phone} | Email: ${company.Email}`, 50, 115);
    
    // Add invoice details
    pdf.fontSize(14).font('Helvetica-Bold').text('INVOICE', 50, 150);
    pdf.fontSize(10).font('Helvetica')
        .text(`Invoice Date: ${order.OrderDate}`, 50, 170)
        .text(`Invoice Number: ${order.OrderNumber}`, 50, 185)
        .text(`Financial Year: ${fyId}`, 50, 200);
    
    // ... rest of PDF generation
    
    return pdf;
};
```

---

## STEP 7: Testing

### API Testing

Use Postman or curl to test the new endpoints:

```bash
# Create a company
curl -X POST http://localhost:5000/api/companies/create \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "gstin": "27AABCU1234A1Z0",
    "legalName": "Test Company Pvt Ltd",
    "email": "test@test.com"
  }'

# Create a financial year
curl -X POST http://localhost:5000/api/financial-years/create \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "fyName": "2024-2025",
    "startDate": "2024-04-01",
    "endDate": "2025-03-31"
  }'

# Generate token
curl -X POST http://localhost:5000/api/access-tokens/generate \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "financialYearId": 1,
    "generatedBy": 1,
    "expiryDate": "2025-03-31"
  }'

# Verify token
curl -X POST http://localhost:5000/api/access-tokens/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_token_here",
    "companyId": 1,
    "financialYearId": 1
  }'
```

---

## STEP 8: Deployment Checklist

- [ ] Run database migration script
- [ ] Migrate existing data to default company
- [ ] Update server routes in index.js
- [ ] Update all existing controllers with company/FY filtering
- [ ] Create authentication middleware
- [ ] Add new UI components
- [ ] Update API calls in existing components
- [ ] Configure environment variables
- [ ] Test all endpoints
- [ ] Test data transfer functionality
- [ ] Update invoice PDF generation
- [ ] Deploy to production
- [ ] Backup database after deployment

---

## TROUBLESHOOTING

### Issue: "CompanyID cannot be null"
**Solution:** Ensure all INSERT operations include CompanyID. Update migrations if using old data.

### Issue: "FinancialYearID mismatch"
**Solution:** Make sure all queries filter by correct FinancialYearID.

### Issue: "Token not found"
**Solution:** Generate new token using `/api/access-tokens/generate`

### Issue: "Transfer failed"
**Solution:** Check database logs for foreign key constraint errors.

---

## NEXT STEPS

1. ✅ Database schema updated
2. ✅ Models created
3. ✅ Controllers created
4. ✅ Routes created
5. 📋 Integrate with server
6. 📋 Update client UI
7. 📋 Test all features
8. 📋 Deploy to production
