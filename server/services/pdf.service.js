const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/bills");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const pdfService = {
    generateBillPDF: (billData, callback) => {
        try {
            const fileName = `bill-${billData.BillNumber}-${Date.now()}.pdf`;
            const filePath = path.join(uploadsDir, fileName);
            
            // Create PDF document
            const doc = new PDFDocument({
                size: "A4",
                margin: 40
            });

            // Pipe to file
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", 50, 50);
            
            // Company Logo & Details (if exists)
            if (billData.LogoPath) {
                // Logo would be rendered here if available
                doc.fontSize(10).text(`[Logo: ${billData.LogoPath}]`, 400, 50);
            }

            // Company Info
            doc.fontSize(10).font("Helvetica");
            const companyStartY = 100;
            doc.text(`${billData.OwnerCompanyName || "Company"}`, 50, companyStartY);
            doc.text(billData.Address || "", 50, companyStartY + 15);
            doc.text(`${billData.City || ""}, ${billData.State || ""}`, 50, companyStartY + 30);
            doc.text(`Phone: ${billData.Phone || ""}`, 50, companyStartY + 45);
            doc.text(`Email: ${billData.Email || ""}`, 50, companyStartY + 60);

            // Bill Info (Right side)
            const billInfoX = 350;
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("BILL DETAILS", billInfoX, companyStartY);
            doc.font("Helvetica");
            doc.text(`Bill #: ${billData.BillNumber}`, billInfoX, companyStartY + 20);
            doc.text(`Date: ${new Date(billData.BillDate).toLocaleDateString()}`, billInfoX, companyStartY + 35);
            if (billData.DueDate) {
                doc.text(`Due Date: ${new Date(billData.DueDate).toLocaleDateString()}`, billInfoX, companyStartY + 50);
            }

            // Customer Info
            const customerY = 200;
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("BILL TO:", 50, customerY);
            doc.font("Helvetica");
            doc.text(billData.CustomerName || "Customer", 50, customerY + 15, { width: 250 });

            // Table Header
            const tableY = 280;
            const colWidth = 90;
            const col1 = 50;
            const col2 = 50 + colWidth;
            const col3 = 50 + colWidth * 2;
            const col4 = 50 + colWidth * 3;

            doc.fontSize(9).font("Helvetica-Bold");
            doc.rect(col1, tableY, 340, 20).stroke();
            doc.text("Item", col1 + 5, tableY + 3);
            doc.text("Qty", col2 + 5, tableY + 3);
            doc.text("Unit Price", col3 + 5, tableY + 3);
            doc.text("Total", col4 + 5, tableY + 3);

            // Table Items
            doc.font("Helvetica");
            doc.fontSize(9);
            let currentY = tableY + 25;

            if (billData.items && Array.isArray(billData.items)) {
                billData.items.forEach((item) => {
                    const lineTotal = item.Quantity * item.UnitPrice;
                    doc.text(item.ProductName || "Item", col1 + 5, currentY);
                    doc.text(item.Quantity.toString(), col2 + 5, currentY);
                    doc.text(`₹${item.UnitPrice.toFixed(2)}`, col3 + 5, currentY);
                    doc.text(`₹${lineTotal.toFixed(2)}`, col4 + 5, currentY);
                    currentY += 20;
                });
            }

            // Totals
            const totalsY = currentY + 20;
            doc.moveTo(col1, totalsY - 5).lineTo(col1 + 340, totalsY - 5).stroke();
            
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Subtotal:", col3 + 5, totalsY);
            doc.text(`₹${(billData.Subtotal || 0).toFixed(2)}`, col4 + 5, totalsY);
            
            doc.text("Grand Total:", col3 + 5, totalsY + 20);
            doc.text(`₹${(billData.GrandTotal || 0).toFixed(2)}`, col4 + 5, totalsY + 20);

            // Notes & Terms
            const notesY = totalsY + 60;
            if (billData.Notes) {
                doc.fontSize(9).font("Helvetica-Bold");
                doc.text("Notes:", 50, notesY);
                doc.font("Helvetica");
                doc.fontSize(8);
                doc.text(billData.Notes, 50, notesY + 15, { width: 450 });
            }

            if (billData.Terms) {
                const termsY = notesY + (billData.Notes ? 60 : 20);
                doc.fontSize(9).font("Helvetica-Bold");
                doc.text("Terms & Conditions:", 50, termsY);
                doc.font("Helvetica");
                doc.fontSize(8);
                doc.text(billData.Terms, 50, termsY + 15, { width: 450 });
            }

            // Bill Status
            doc.fontSize(8).font("Helvetica-Bold");
            doc.text(`Status: ${billData.BillStatus}`, 50, 720);

            // End document
            doc.end();

            stream.on("finish", () => {
                callback(null, {
                    fileName: fileName,
                    filePath: filePath,
                    url: `/uploads/bills/${fileName}`
                });
            });

            stream.on("error", (err) => {
                callback(err);
            });
        } catch (error) {
            callback(error);
        }
    }
};

module.exports = pdfService;
