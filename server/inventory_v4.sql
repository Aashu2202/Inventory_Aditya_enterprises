-- ========================================
-- INVENTORY MANAGEMENT SYSTEM - VERSION 4
-- Enhanced with Companies, Financial Years, and Token Management
-- ========================================

CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- ========================================
-- 1. USERS TABLE (Enhanced)
-- ========================================
CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    UserRole ENUM('SuperAdmin', 'CompanyAdmin', 'Manager', 'Staff') DEFAULT 'Staff',
    CompanyID INT,
    IsActive TINYINT(1) DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE SET NULL
);

-- ========================================
-- 2. COMPANIES TABLE (New)
-- ========================================
CREATE TABLE IF NOT EXISTS Companies (
    CompanyID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(150) NOT NULL UNIQUE,
    LegalName VARCHAR(150),
    GSTIN VARCHAR(20) UNIQUE NOT NULL,
    PAN VARCHAR(20),
    Email VARCHAR(100),
    Phone VARCHAR(20),
    Website VARCHAR(100),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    PostalCode VARCHAR(10),
    Country VARCHAR(50) DEFAULT 'India',
    LogoPath VARCHAR(255),
    CompanyType ENUM('Sole Proprietor', 'Partnership', 'Private Limited', 'Public Limited') DEFAULT 'Private Limited',
    IsActive TINYINT(1) DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gstin (GSTIN),
    INDEX idx_status (IsActive)
);

-- ========================================
-- 3. FINANCIAL YEARS TABLE (New)
-- ========================================
CREATE TABLE IF NOT EXISTS FinancialYears (
    FinancialYearID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FYName VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status ENUM('Active', 'Closed', 'Archived') DEFAULT 'Active',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ClosedDate DATETIME,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_company_fy (CompanyID, FYName),
    INDEX idx_status (Status)
);

-- ========================================
-- 4. ACCESS TOKENS TABLE (New)
-- ========================================
CREATE TABLE IF NOT EXISTS AccessTokens (
    TokenID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    TokenValue VARCHAR(255) UNIQUE NOT NULL,
    TokenType ENUM('Annual', 'Monthly', 'Temporary') DEFAULT 'Annual',
    GeneratedBy INT NOT NULL, -- UserID of SuperAdmin who generated it
    IsActive TINYINT(1) DEFAULT 1,
    IssuedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiryDate DATETIME,
    LastUsedDate DATETIME,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (GeneratedBy) REFERENCES Users(UserID),
    UNIQUE KEY uk_token_fy (CompanyID, FinancialYearID),
    INDEX idx_active_token (IsActive, ExpiryDate)
);

-- ========================================
-- 5. FINANCIAL YEAR DATA TRANSFER LOG (New)
-- ========================================
CREATE TABLE IF NOT EXISTS FYTransferLogs (
    TransferID INT AUTO_INCREMENT PRIMARY KEY,
    FromFinancialYearID INT NOT NULL,
    ToFinancialYearID INT NOT NULL,
    CompanyID INT NOT NULL,
    TransferredBy INT NOT NULL, -- UserID of CompanyAdmin
    TransferredDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'In Progress', 'Completed', 'Failed') DEFAULT 'Pending',
    Description VARCHAR(500),
    Notes TEXT,
    FOREIGN KEY (FromFinancialYearID) REFERENCES FinancialYears(FinancialYearID),
    FOREIGN KEY (ToFinancialYearID) REFERENCES FinancialYears(FinancialYearID),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID),
    FOREIGN KEY (TransferredBy) REFERENCES Users(UserID)
);

-- ========================================
-- 6. EXISTING TABLES - MODIFIED TO SUPPORT MULTI-COMPANY
-- ========================================

-- Modify Categories to support multi-company
CREATE TABLE IF NOT EXISTS Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    CategoryName VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    UNIQUE KEY uk_category (CompanyID, CategoryName)
);

-- Modify Suppliers to support multi-company
CREATE TABLE IF NOT EXISTS Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    CompanyName VARCHAR(100) NOT NULL,
    ContactName VARCHAR(50),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    GSTIN VARCHAR(20),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    Country VARCHAR(50) DEFAULT 'India',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    INDEX idx_company (CompanyID)
);

-- Modify Warehouses to support multi-company
CREATE TABLE IF NOT EXISTS Warehouses (
    WarehouseID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    WarehouseName VARCHAR(100) NOT NULL,
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    Phone VARCHAR(20),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    INDEX idx_company (CompanyID)
);

-- Modify Products to support multi-company
CREATE TABLE IF NOT EXISTS Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    ProductName VARCHAR(100) NOT NULL,
    CategoryID INT NOT NULL,
    SupplierID INT NOT NULL,
    HSNCode VARCHAR(20),
    GSTPercent DECIMAL(5,2) DEFAULT 0,
    UnitPrice DECIMAL(10,2) NOT NULL,
    RetailPrice DECIMAL(10,2),
    WholesalePrice DECIMAL(10,2),
    ReorderLevel INT DEFAULT 0,
    IsActive TINYINT(1) DEFAULT 1,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    INDEX idx_company (CompanyID),
    INDEX idx_fy (FinancialYearID)
);

-- Modify ProductBarcodes
CREATE TABLE IF NOT EXISTS ProductBarcodes (
    BarcodeID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    BarcodeValue VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
);

-- Modify Inventory to support multi-company
CREATE TABLE IF NOT EXISTS Inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    Quantity INT DEFAULT 0,
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UK_Inventory UNIQUE (CompanyID, FinancialYearID, ProductID, WarehouseID),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- Modify Customers to support multi-company
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    CompanyName VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100),
    GSTIN VARCHAR(20),
    Address VARCHAR(200),
    City VARCHAR(50),
    State VARCHAR(50),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    INDEX idx_company (CompanyID)
);

-- Modify Purchases to support multi-company
CREATE TABLE IF NOT EXISTS Purchases (
    PurchaseID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    SupplierID INT NOT NULL,
    InvoiceNumber VARCHAR(50),
    PurchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsGST TINYINT(1) DEFAULT 1,
    GSTType VARCHAR(10),
    TotalAmount DECIMAL(12,2),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    INDEX idx_company_fy (CompanyID, FinancialYearID)
);

-- Modify PurchaseDetails
CREATE TABLE IF NOT EXISTS PurchaseDetails (
    PurchaseDetailID INT AUTO_INCREMENT PRIMARY KEY,
    PurchaseID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitCost DECIMAL(10,2),
    CGST DECIMAL(5,2) DEFAULT 0,
    SGST DECIMAL(5,2) DEFAULT 0,
    IGST DECIMAL(5,2) DEFAULT 0,
    LineTotal DECIMAL(15,2) AS (
        Quantity * UnitCost +
        (Quantity * UnitCost * (CGST + SGST + IGST) / 100)
    ) STORED,
    FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Modify Orders to support multi-company
CREATE TABLE IF NOT EXISTS Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    OrderNumber VARCHAR(50),
    CustomerID INT NOT NULL,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsGST TINYINT(1) DEFAULT 1,
    GSTType VARCHAR(10),
    TotalAmount DECIMAL(12,2),
    OrderStatus VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    INDEX idx_company_fy (CompanyID, FinancialYearID)
);

-- Modify OrderDetails
CREATE TABLE IF NOT EXISTS OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2),
    GSTPercent DECIMAL(5,2),
    GSTAmount DECIMAL(15,2) AS (Quantity * UnitPrice * GSTPercent / 100) STORED,
    LineTotal DECIMAL(15,2) AS (Quantity * UnitPrice + (Quantity * UnitPrice * GSTPercent / 100)) STORED,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Modify StockMovements to support multi-company
CREATE TABLE IF NOT EXISTS StockMovements (
    StockMoveID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    Quantity INT NOT NULL,
    MovementType VARCHAR(20),
    ReferenceID INT,
    MovementDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    INDEX idx_company_fy (CompanyID, FinancialYearID)
);

-- Modify InventoryAudit to support multi-company
CREATE TABLE IF NOT EXISTS InventoryAudit (
    AuditID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    ProductID INT,
    WarehouseID INT,
    OldQuantity INT,
    NewQuantity INT,
    ChangeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Reason VARCHAR(200),
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE
);

-- Modify Accounts to support multi-company
CREATE TABLE IF NOT EXISTS Accounts (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    AccountName VARCHAR(100) NOT NULL,
    AccountType ENUM('CASH', 'BANK') DEFAULT 'CASH',
    Balance DECIMAL(15,2) DEFAULT 0,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    INDEX idx_company (CompanyID)
);

-- Modify Expenses to support multi-company
CREATE TABLE IF NOT EXISTS Expenses (
    ExpenseID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyID INT NOT NULL,
    FinancialYearID INT NOT NULL,
    ExpenseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Category VARCHAR(100) NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    Description VARCHAR(255),
    AccountID INT,
    FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID) ON DELETE CASCADE,
    FOREIGN KEY (FinancialYearID) REFERENCES FinancialYears(FinancialYearID) ON DELETE CASCADE,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID),
    INDEX idx_company_fy (CompanyID, FinancialYearID)
);

-- ========================================
-- TRIGGERS FOR STOCK UPDATES
-- ========================================
DROP TRIGGER IF EXISTS trg_UpdateInventory;
CREATE TRIGGER trg_UpdateInventory
AFTER INSERT ON StockMovements
FOR EACH ROW
BEGIN
    INSERT INTO Inventory (CompanyID, FinancialYearID, ProductID, WarehouseID, Quantity, LastUpdated)
    VALUES (NEW.CompanyID, NEW.FinancialYearID, NEW.ProductID, NEW.WarehouseID, NEW.Quantity, NOW())
    ON DUPLICATE KEY UPDATE 
        Quantity = Inventory.Quantity + NEW.Quantity,
        LastUpdated = NOW();
END;

-- ========================================
-- VIEWS FOR REPORTING
-- ========================================
CREATE OR REPLACE VIEW vw_StockSummary AS
SELECT 
    i.CompanyID,
    i.FinancialYearID,
    p.ProductID,
    p.ProductName,
    c.CategoryName,
    SUM(i.Quantity) AS TotalQuantity,
    p.UnitPrice,
    (SUM(i.Quantity) * p.UnitPrice) AS TotalValue
FROM Inventory i
LEFT JOIN Products p ON i.ProductID = p.ProductID
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
GROUP BY i.CompanyID, i.FinancialYearID, p.ProductID, p.ProductName, c.CategoryName, p.UnitPrice;

CREATE OR REPLACE VIEW vw_GSTSales AS
SELECT 
    o.CompanyID,
    o.FinancialYearID,
    o.OrderID,
    o.OrderDate,
    c.CompanyName AS CustomerName,
    SUM(od.GSTAmount) AS TotalGST,
    SUM(od.LineTotal) AS InvoiceAmount
FROM Orders o
JOIN OrderDetails od ON o.OrderID = od.OrderID
JOIN Customers c ON o.CustomerID = c.CustomerID
WHERE o.IsGST = 1
GROUP BY o.CompanyID, o.FinancialYearID, o.OrderID, o.OrderDate, c.CompanyName;

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================
INSERT INTO Companies (CompanyName, LegalName, GSTIN, PAN, Email, Phone, Address, City, State)
VALUES ('Aditya Enterprises', 'Aditya Enterprises Pvt Ltd', '27AABCU1234A1Z0', 'AABCU1234A', 'info@adityaenterprises.com', '9876543210', '123 Business Street', 'Pune', 'Maharashtra');

INSERT INTO FinancialYears (CompanyID, FYName, StartDate, EndDate, Status)
SELECT CompanyID, '2024-2025', '2024-04-01', '2025-03-31', 'Active'
FROM Companies
WHERE CompanyName = 'Aditya Enterprises';

INSERT INTO Users (Username, Password, Email, UserRole, CompanyID)
SELECT 'superadmin', 'hashed_password_here', 'admin@adityaenterprises.com', 'SuperAdmin', CompanyID
FROM Companies
WHERE CompanyName = 'Aditya Enterprises'
LIMIT 1;
