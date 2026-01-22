const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const supplierRoutes = require("./routes/supplier.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const customerRoutes = require("./routes/customer.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const orderRoutes = require("./routes/order.routes");
const stockMovementRoutes = require("./routes/stockMovement.routes");
const storeRoutes = require("./routes/store.routes");
const transferRoutes = require("./routes/transfer.routes");
const saleRoutes = require("./routes/sale.routes");
const vendorRoutes = require("./routes/vendor.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const backupRoutes = require("./routes/backup.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const accountRoutes = require("./routes/account.routes");
const expenseRoutes = require("./routes/expense.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/expenses", expenseRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
