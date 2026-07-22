const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/invoice/:orderId
const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate("items.product shippingAddress user");
  if (!order) return res.status(404).json({ message: "Order not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text("Sharanee", { align: "left" });
  doc.fontSize(10).fillColor("#666").text("Tax Invoice", { align: "left" });
  doc.moveDown();

  doc.fillColor("#000").fontSize(11);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Order Date: ${order.createdAt.toDateString()}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Order Status: ${order.orderStatus}`);
  doc.moveDown();

  if (order.shippingAddress) {
    const a = order.shippingAddress;
    doc.font("Helvetica-Bold").text("Ship To:");
    doc.font("Helvetica").text(`${a.fullName}, ${a.mobile}`);
    doc.text(`${a.houseNo}, ${a.area}${a.landmark ? ", " + a.landmark : ""}`);
    doc.text(`${a.city}, ${a.state} - ${a.pincode}`);
    doc.moveDown();
  }

  doc.font("Helvetica-Bold");
  doc.text("Items", { underline: true });
  doc.moveDown(0.5);
  doc.font("Helvetica");

  order.items.forEach((i) => {
    const name = i.product?.productName || "Product";
    doc.text(`${name}  x${i.quantity}  —  Rs. ${(i.price * i.quantity).toLocaleString("en-IN")}`);
  });

  doc.moveDown();
  doc.font("Helvetica-Bold").text(`Total: Rs. ${order.totalAmount.toLocaleString("en-IN")}`);

  doc.moveDown(2);
  doc.font("Helvetica").fontSize(9).fillColor("#888").text("Thank you for shopping with Sharanee.", { align: "center" });

  doc.end();
});

module.exports = { downloadInvoice };
