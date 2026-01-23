# Aditya Enterprises Inventory Management System - Project Documentation

## 1. Project Overview
This project is a comprehensive Inventory Management System designed for Aditya Enterprises. It manages the entire supply chain, including suppliers, products, inventory across warehouses, customer orders (sales), purchase orders, and financial tracking (expenses, accounts).

The system is built as a web-based application with a React frontend and Node.js/Express backend, utilizing a MySQL database. It also includes an Electron-based desktop wrapper.

## 2. Technical Stack

### Frontend (`/client`)
- **Framework**: React.js (v19)
- **Build Tool**: React Scripts (Create React App)
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios
- **Styling**: CSS (Modular & Global), Lucide React for icons
- **Testing**: React Testing Library

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database Driver**: mysql2
- **Middleware**: CORS, Express JSON parser

### Database
- **System**: MySQL
- **Schema**: Relational schema (refer to `inventory_v3.sql`)
- **Key Features**: Triggers for automatic inventory updates, Stored procedures (implied by complex logic usually, though triggers are explicit), Views for summaries.

### Desktop (`/desktop`)
- **Wrapper**: Electron (v33) - Wraps the web application for desktop usage.

## 3. Project Structure

```
Inventory_Aditya_enterprises/
├── client/                 # React Frontend Application
│   ├── public/             
│   ├── src/                
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main route pages
│   │   ├── styles/         # CSS files
│   │   ├── App.js          # Main Component
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── README.md
│
├── server/                 # Node.js/Express Backend
│   ├── config/             # DB Configuration (db.js)
│   ├── controllers/        # Request handling logic
│   ├── models/             # (Likely DAO or ORM-like wrappers)
│   ├── routes/             # API Route definitions
│   ├── index.js            # Server entry point
│   ├── inventory_v3.sql    # Primary Database Schema
│   └── package.json
│
└── desktop/                # Electron Desktop App
    ├── main.js             # Electron main process
    └── package.json
```

## 4. Database Schema (Schema V3)

The database `inventory_db` consists of the following key tables:

### Core Definitions
- **Categories**: Product categories (`CategoryID`, `CategoryName`).
- **Suppliers**: Vendor details (`SupplierID`, `CompanyName`, `GSTIN`, etc.).
- **Customers**: Client details (`CustomerID`, `CompanyName`, `GSTIN`, etc.).
- **Warehouses**: Storage locations (`WarehouseID`, `WarehouseName`).
- **Products**: Item master (`ProductID`, `UnitPrice`, `GSTPercent`, `HSNCode`, etc.).
- **ProductBarcodes**: Barcode mapping for products.

### Inventory & Stock
- **Inventory**: Current stock levels per product per warehouse.
- **StockMovements**: Log of all stock changes (IN/OUT).
    - *Trigger*: `trg_UpdateInventory` automatically updates the `Inventory` table when a `StockMovement` is recorded.
- **InventoryAudit**: Logs manual adjustments or audits.

### Transactions
- **Purchases**: Invoices from suppliers (`PurchaseID`, `TotalAmount`, `GSTType`).
- **PurchaseDetails**: Line items for purchases (calculates Taxes, Line Totals).
- **Orders**: Sales to customers (`OrderID`, `OrderStatus`, `TotalAmount`).
- **OrderDetails**: Line items for sales (calculates GST, Line Totals).

### Finance
- **Accounts**: Cash/Bank accounts (`AccountID`, `Balance`, `AccountType`).
- **Expenses**: Business expenses (`ExpenseID`, `Category`, `Amount`, `AccountID`).

### Views
- **vw_StockSummary**: Aggregates total quantity and value per product.
- **vw_GSTSales**: Summarizes GST and invoice amounts for reporting.

## 5. API Architecture

The backend exposes a RESTful API at `http://localhost:5000/api`.

### Key Routes
| Resource | Route Base | Description |
|----------|------------|-------------|
| **Auth** | `/api` | Authentication endpoints (login/register) |
| **Products** | `/api/products` | CRUD operations for products |
| **Orders** | `/api/orders` | Sales order management |
| **Purchases** | `/api/purchases` | Purchase entry management |
| **Inventory** | `/api/stock-movements` | Stock history and adjustments |
| **Dashboard** | `/api/dashboard` | Statistics and charts |
| **Customers** | `/api/customers` | Customer database |
| **Suppliers** | `/api/suppliers` | Supplier database |
| **Warehouses** | `/api/warehouses` | Warehouse management |
| **Accounts** | `/api/accounts` | Cash/Bank management |

## 6. Workflow

1.  **Product Setup**: created in `Products`, assigned to `Categories` and `Suppliers`.
2.  **Purchasing**: 
    - A Purchase is recorded.
    - `StockMovements` are created (Type: PURCHASE).
    - `trg_UpdateInventory` increases `Inventory` count.
3.  **Selling**:
    - An Order is created.
    - `StockMovements` are created (Type: SALE) (Presumably handled by backend logic).
    - `trg_UpdateInventory` decreases `Inventory` count.
4.  **Accounting**:
    - Income/Expenses update `Accounts`.

## 7. Setup & Installation

### Prerequisites
- Node.js & npm
- MySQL Server

### Database Setup
1.  Open MySQL Workbench or CLI.
2.  Run the script `server/inventory_v3.sql` to create the database and tables.
3.  Configure `server/config/db.js` with your MySQL credentials (default: user=`root`, pass=`root`).

### Running the Application

**1. Server**
```bash
cd server
npm install
npm start
# Runs on Port 5000
```

**2. Client**
```bash
cd client
npm install
npm start
# Runs on Port 3000
```

**3. Desktop (Optional)**
```bash
cd desktop
npm install
npm start
# Launches Electron window
```
