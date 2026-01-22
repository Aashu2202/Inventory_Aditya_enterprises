USE inventory_db;

-- Stores Table
CREATE TABLE IF NOT EXISTS Stores (
    StoreId INT AUTO_INCREMENT PRIMARY KEY,
    StoreName VARCHAR(255) NOT NULL,
    Location VARCHAR(255),
    ContactNumber VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE
);

-- Products Table
CREATE TABLE IF NOT EXISTS Products (
    ProductId INT AUTO_INCREMENT PRIMARY KEY,
    Barcode VARCHAR(100) UNIQUE,
    SKU VARCHAR(100) UNIQUE,
    ProductName VARCHAR(255) NOT NULL,
    Description TEXT,
    CategoryId INT,
    PurchasePrice DECIMAL(10, 2),
    SellingPrice DECIMAL(10, 2),
    GST_Percentage DECIMAL(5, 2) DEFAULT 0.00,
    MinStockLevel INT DEFAULT 5,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

-- Inventory (Multi-store stock)
CREATE TABLE IF NOT EXISTS Inventory (
    InventoryId INT AUTO_INCREMENT PRIMARY KEY,
    ProductId INT,
    StoreId INT,
    Quantity INT DEFAULT 0,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    FOREIGN KEY (StoreId) REFERENCES Stores(StoreId),
    UNIQUE KEY (ProductId, StoreId)
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS Vendors (
    VendorId INT AUTO_INCREMENT PRIMARY KEY,
    VendorName VARCHAR(255) NOT NULL,
    GSTIN VARCHAR(20),
    ContactPerson VARCHAR(255),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(100),
    Address TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS PurchaseOrders (
    POId INT AUTO_INCREMENT PRIMARY KEY,
    VendorId INT,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(15, 2),
    Status ENUM('Pending', 'Received', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (VendorId) REFERENCES Vendors(VendorId)
);

-- Sales Table
CREATE TABLE IF NOT EXISTS Sales (
    SaleId INT AUTO_INCREMENT PRIMARY KEY,
    StoreId INT,
    UserId INT,
    BillNumber VARCHAR(100) UNIQUE,
    SubTotal DECIMAL(15, 2),
    GST_Total DECIMAL(15, 2),
    Discount DECIMAL(15, 2),
    GrandTotal DECIMAL(15, 2),
    PaymentMode ENUM('Cash', 'Card', 'UPI', 'Multiple') DEFAULT 'Cash',
    CustomerName VARCHAR(255) DEFAULT 'Walking Customer',
    CustomerMobile VARCHAR(20),
    CustomerAddress TEXT,
    SaleDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StoreId) REFERENCES Stores(StoreId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Sales Items
CREATE TABLE IF NOT EXISTS SaleItems (
    SaleItemId INT AUTO_INCREMENT PRIMARY KEY,
    SaleId INT,
    ProductId INT,
    Quantity INT,
    UnitPrice DECIMAL(10, 2),
    GST_Amount DECIMAL(10, 2),
    Total DECIMAL(15, 2),
    FOREIGN KEY (SaleId) REFERENCES Sales(SaleId),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- Store Transfers
CREATE TABLE IF NOT EXISTS StockTransfers (
    TransferId INT AUTO_INCREMENT PRIMARY KEY,
    ProductId INT,
    FromStoreId INT,
    ToStoreId INT,
    Quantity INT,
    TransferDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Completed',
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    FOREIGN KEY (FromStoreId) REFERENCES Stores(StoreId),
    FOREIGN KEY (ToStoreId) REFERENCES Stores(StoreId)
);

-- Initial Data
INSERT IGNORE INTO Categories (CategoryName) VALUES ('General'), ('Electronics'), ('Grocery');
INSERT IGNORE INTO Stores (StoreName, Location) VALUES ('Main Warehouse', 'Downtown'), ('City Outlet', 'Mall Road');
