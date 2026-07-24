const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");

/*
|--------------------------------------------------------------------------
| Sharanee Invoice Brand Configuration
|--------------------------------------------------------------------------
*/

const COLORS = {
  cocoa: "#542D19",
  cocoaDark: "#3A1B0E",
  gold: "#C99745",
  lightGold: "#E8D2A6",
  cream: "#FCF8F1",
  softCream: "#F7EFE3",
  text: "#30241E",
  muted: "#806D62",
  border: "#DCC39B",
  white: "#FFFFFF",
};

const COMPANY = {
  name: "Sharanee",
  tagline: "Saree Inskirt",
  addressLine1: "No. 3/344, Aranganur, Kamaneri",
  addressLine2: "Mettur, Tamil Nadu - 636451",
  phone: "+91 75488 25075",
  email: "hello@sharanee.com",
  website: "www.sharanee.com",
};

/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safeText = (value, fallback = "—") => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value).trim();
};

const createInvoiceNumber = (order) => {
  const date = new Date(order.createdAt || Date.now());

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const orderSuffix = String(order._id)
    .slice(-6)
    .toUpperCase();

  return `INV-${year}${month}${day}-${orderSuffix}`;
};

const getShippingAddressLines = (address) => {
  if (!address) {
    return ["Address unavailable"];
  }

  const lines = [];

  const customerName =
    address.fullName ||
    address.name ||
    "Customer";

  const mobile =
    address.mobile ||
    address.phone ||
    "";

  lines.push(
    mobile
      ? `${customerName} · ${mobile}`
      : customerName
  );

  const streetParts = [
    address.houseNo,
    address.addressLine1,
    address.street,
    address.area,
    address.landmark,
  ].filter(Boolean);

  if (streetParts.length > 0) {
    lines.push(streetParts.join(", "));
  }

  const cityParts = [
    address.city,
    address.district,
    address.state,
  ].filter(Boolean);

  const postalCode =
    address.pincode ||
    address.postalCode ||
    "";

  if (cityParts.length > 0 || postalCode) {
    lines.push(
      `${cityParts.join(", ")}${
        postalCode ? ` - ${postalCode}` : ""
      }`
    );
  }

  return lines;
};

const drawTextPair = (
  doc,
  label,
  value,
  x,
  y,
  labelWidth = 95
) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.cocoaDark)
    .text(label, x, y, {
      width: labelWidth,
      continued: false,
    });

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.text)
    .text(`:  ${safeText(value)}`, x + labelWidth, y, {
      width: 150,
    });
};

const drawSectionTitle = (
  doc,
  title,
  x,
  y,
  width
) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.cocoa)
    .text(title.toUpperCase(), x, y, {
      width,
    });
};

const drawAddressBox = ({
  doc,
  title,
  lines,
  x,
  y,
  width,
  height,
}) => {
  doc
    .roundedRect(x, y, width, height, 2)
    .fillAndStroke(COLORS.cream, COLORS.border);

  drawSectionTitle(
    doc,
    title,
    x + 16,
    y + 14,
    width - 32
  );

  let lineY = y + 42;

  lines.slice(0, 4).forEach((line, index) => {
    doc
      .font(index === 0 ? "Helvetica-Bold" : "Helvetica")
      .fontSize(index === 0 ? 9.5 : 8.5)
      .fillColor(COLORS.text)
      .text(safeText(line), x + 16, lineY, {
        width: width - 32,
        lineGap: 2,
      });

    lineY += index === 0 ? 20 : 16;
  });
};

const drawSummaryBox = ({
  doc,
  order,
  x,
  y,
  width,
  height,
}) => {
  doc
    .roundedRect(x, y, width, height, 2)
    .fillAndStroke(COLORS.cream, COLORS.border);

  drawSectionTitle(
    doc,
    "Order Summary",
    x + 16,
    y + 14,
    width - 32
  );

  const totalQuantity = order.items.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const summaryRows = [
    ["Items", order.items.length],
    ["Total Quantity", totalQuantity],
    [
      "Total Amount",
      formatCurrency(
        order.finalAmount || order.totalAmount
      ),
    ],
  ];

  let rowY = y + 46;

  summaryRows.forEach(([label, value]) => {
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.text)
      .text(label, x + 16, rowY, {
        width: 85,
      });

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(COLORS.text)
      .text(":", x + 102, rowY);

    doc
      .font(
        label === "Total Amount"
          ? "Helvetica-Bold"
          : "Helvetica"
      )
      .fontSize(8.5)
      .fillColor(
        label === "Total Amount"
          ? COLORS.cocoa
          : COLORS.text
      )
      .text(String(value), x + 116, rowY, {
        width: width - 132,
        align: "right",
      });

    rowY += 23;
  });
};

const drawTableHeader = (
  doc,
  y,
  columns
) => {
  const tableX = 40;
  const tableWidth = 515;
  const headerHeight = 30;

  doc
    .rect(tableX, y, tableWidth, headerHeight)
    .fill(COLORS.cocoa);

  columns.forEach((column) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLORS.white)
      .text(
        column.label.toUpperCase(),
        column.x,
        y + 10,
        {
          width: column.width,
          align: column.align || "left",
        }
      );
  });

  return y + headerHeight;
};

const drawProductRow = ({
  doc,
  item,
  index,
  y,
  columns,
}) => {
  const product = item.product || {};

  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.price || 0);
  const lineTotal = quantity * unitPrice;

  const rowHeight = 62;

  doc
    .rect(40, y, 515, rowHeight)
    .fillAndStroke(
      index % 2 === 0
        ? COLORS.white
        : COLORS.cream,
      COLORS.border
    );

  columns.slice(1).forEach((column) => {
    doc
      .moveTo(column.x - 6, y)
      .lineTo(column.x - 6, y + rowHeight)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();
  });

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.text)
    .text(
      String(index + 1),
      columns[0].x,
      y + 25,
      {
        width: columns[0].width,
        align: "center",
      }
    );

  const productName =
    product.productName ||
    product.name ||
    "Product";

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.text)
    .text(
      productName,
      columns[1].x,
      y + 13,
      {
        width: columns[1].width,
        ellipsis: true,
      }
    );

  const productMeta = [
    product.fabric
      ? `Fabric: ${product.fabric}`
      : "",
    product.color
      ? `Color: ${product.color}`
      : "",
    product.size?.length
      ? `Size: ${product.size.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("  |  ");

  if (productMeta) {
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(COLORS.muted)
      .text(
        productMeta,
        columns[1].x,
        y + 32,
        {
          width: columns[1].width,
          ellipsis: true,
        }
      );
  }

  const description =
    product.description ||
    product.occasion ||
    product.category?.categoryName ||
    "Sharanee premium product";

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(
      safeText(description),
      columns[2].x,
      y + 18,
      {
        width: columns[2].width,
        height: 32,
        ellipsis: true,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.text)
    .text(
      String(quantity),
      columns[3].x,
      y + 25,
      {
        width: columns[3].width,
        align: "center",
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.text)
    .text(
      formatCurrency(unitPrice),
      columns[4].x,
      y + 25,
      {
        width: columns[4].width,
        align: "right",
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.cocoa)
    .text(
      formatCurrency(lineTotal),
      columns[5].x,
      y + 25,
      {
        width: columns[5].width,
        align: "right",
      }
    );

  return y + rowHeight;
};

const drawPageHeader = (
  doc,
  order,
  invoiceNumber,
  logoPath
) => {
  const pageWidth = doc.page.width;

  doc
    .rect(0, 0, pageWidth, 18)
    .fill(COLORS.cocoa);

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLORS.lightGold)
    .text(
      "TIMELESS DESIGNS ROOTED IN TRADITION  •  HANDCRAFTED ELEGANCE  •  SAREE INSKIRT CRAFTED FOR EVERY CELEBRATION",
      30,
      6,
      {
        width: pageWidth - 60,
        align: "center",
      }
    );

  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 42, 38, {
        fit: [185, 90],
        align: "left",
        valign: "center",
      });
    } catch (error) {
      console.error(
        "Unable to add Sharanee logo:",
        error.message
      );

      doc
        .font("Times-Bold")
        .fontSize(24)
        .fillColor(COLORS.cocoa)
        .text("SHARANEE", 42, 62);
    }
  } else {
    doc
      .font("Times-Bold")
      .fontSize(24)
      .fillColor(COLORS.cocoa)
      .text("SHARANEE", 42, 62);
  }

  doc
    .moveTo(240, 38)
    .lineTo(240, 133)
    .strokeColor(COLORS.border)
    .lineWidth(0.7)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.cocoa)
    .text(COMPANY.name, 258, 44);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(
      COMPANY.addressLine1,
      258,
      62,
      { width: 145 }
    )
    .text(
      COMPANY.addressLine2,
      258,
      76,
      { width: 145 }
    )
    .text(
      COMPANY.phone,
      258,
      96,
      { width: 145 }
    )
    .text(
      COMPANY.email,
      258,
      110,
      { width: 145 }
    )
    .text(
      COMPANY.website,
      258,
      124,
      { width: 145 }
    );

  doc
    .font("Times-Bold")
    .fontSize(22)
    .fillColor(COLORS.cocoaDark)
    .text("TAX INVOICE", 405, 40, {
      width: 150,
      align: "right",
    });

  doc
    .moveTo(442, 70)
    .lineTo(555, 70)
    .strokeColor(COLORS.gold)
    .lineWidth(1)
    .stroke();

  const detailsX = 404;
  let detailsY = 81;

  const invoiceDetails = [
    ["Invoice No.", invoiceNumber],
    ["Order ID", String(order._id)],
    ["Order Date", formatDate(order.createdAt)],
    ["Invoice Date", formatDate(new Date())],
    ["Payment Method", order.paymentMethod],
    ["Payment Status", order.paymentStatus],
    ["Order Status", order.orderStatus],
  ];

  invoiceDetails.forEach(([label, value]) => {
    drawTextPair(
      doc,
      label,
      value,
      detailsX,
      detailsY,
      69
    );

    detailsY += 14;
  });
};

const drawFooter = (doc) => {
  const pageHeight = doc.page.height;

  doc
    .moveTo(40, pageHeight - 53)
    .lineTo(555, pageHeight - 53)
    .strokeColor(COLORS.gold)
    .lineWidth(0.8)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(COLORS.cocoa)
    .text(
      "Sharanee Saree Inskirt",
      40,
      pageHeight - 42,
      {
        width: 515,
        align: "center",
      }
    );

  doc
    .font("Helvetica")
    .fontSize(6.8)
    .fillColor(COLORS.muted)
    .text(
      "Handcrafted Elegance  •  Timeless Designs Rooted in Tradition  •  Saree Inskirt Crafted for Every Celebration",
      40,
      pageHeight - 27,
      {
        width: 515,
        align: "center",
      }
    );
};

/*
|--------------------------------------------------------------------------
| Download Invoice
|--------------------------------------------------------------------------
|
| @route  GET /api/invoice/:orderId
| @access Private
|
*/

const downloadInvoice = asyncHandler(
  async (req, res) => {
    const order = await Order.findById(
      req.params.orderId
    ).populate([
      {
        path: "items.product",
        populate: {
          path: "category",
          select: "categoryName name",
        },
      },
      {
        path: "shippingAddress",
      },
      {
        path: "user",
        select: "fullName name email phone mobile",
      },
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
     * Optional security check:
     * Customer can download only their own invoice.
     * Admin can download any customer's invoice.
     */
    const loggedInUserId =
      req.user?._id?.toString() ||
      req.user?.id?.toString();

    const orderUserId =
      order.user?._id?.toString() ||
      order.user?.toString();

    const isAdmin = req.user?.role === "admin";

    if (
      loggedInUserId &&
      orderUserId &&
      loggedInUserId !== orderUserId &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to download this invoice",
      });
    }

    const invoiceNumber =
      createInvoiceNumber(order);

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Sharanee-Invoice-${invoiceNumber}.pdf"`
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: `Sharanee Tax Invoice ${invoiceNumber}`,
        Author: "Sharanee Saree Inskirt",
        Subject: `Invoice for order ${order._id}`,
        Creator: "Sharanee",
      },
    });

    doc.pipe(res);

    const logoPath = path.join(
      __dirname,
      "..",
      "assets",
      "sharanee-logo.png"
    );

    /*
     * Header
     */
    drawPageHeader(
      doc,
      order,
      invoiceNumber,
      logoPath
    );

    /*
     * Address and summary section
     */
    const customerName =
      order.user?.fullName ||
      order.user?.name ||
      order.shippingAddress?.fullName ||
      "Customer";

    const customerPhone =
      order.user?.phone ||
      order.user?.mobile ||
      order.shippingAddress?.mobile ||
      "";

    const shippingLines =
      getShippingAddressLines(
        order.shippingAddress
      );

    const billingLines = [
      customerPhone
        ? `${customerName} · ${customerPhone}`
        : customerName,
      ...shippingLines.slice(1),
    ];

    const boxY = 165;
    const boxHeight = 112;

    drawAddressBox({
      doc,
      title: "Billed To",
      lines: billingLines,
      x: 40,
      y: boxY,
      width: 170,
      height: boxHeight,
    });

    drawAddressBox({
      doc,
      title: "Shipping Address",
      lines: shippingLines,
      x: 210,
      y: boxY,
      width: 190,
      height: boxHeight,
    });

    drawSummaryBox({
      doc,
      order,
      x: 400,
      y: boxY,
      width: 155,
      height: boxHeight,
    });

    /*
     * Product table
     */
    const columns = [
      {
        label: "#",
        x: 44,
        width: 25,
        align: "center",
      },
      {
        label: "Product",
        x: 75,
        width: 132,
      },
      {
        label: "Description",
        x: 213,
        width: 122,
      },
      {
        label: "Qty",
        x: 341,
        width: 35,
        align: "center",
      },
      {
        label: "Unit Price",
        x: 382,
        width: 74,
        align: "right",
      },
      {
        label: "Total",
        x: 462,
        width: 86,
        align: "right",
      },
    ];

    let tableY = drawTableHeader(
      doc,
      294,
      columns
    );

    order.items.forEach((item, index) => {
      /*
       * Add a new page if many products cause overflow.
       */
      if (tableY > 650) {
        drawFooter(doc);

        doc.addPage({
          size: "A4",
          margin: 0,
        });

        drawPageHeader(
          doc,
          order,
          invoiceNumber,
          logoPath
        );

        tableY = drawTableHeader(
          doc,
          165,
          columns
        );
      }

      tableY = drawProductRow({
        doc,
        item,
        index,
        y: tableY,
        columns,
      });
    });

    /*
     * Invoice totals
     */
    const subtotal = Number(
      order.totalAmount || 0
    );

    const discount = Number(
      order.discount || 0
    );

    const finalAmount = Number(
      order.finalAmount ||
        Math.max(0, subtotal - discount)
    );

    const shippingCharge = Math.max(
      0,
      finalAmount - (subtotal - discount)
    );

    if (tableY > 570) {
      drawFooter(doc);

      doc.addPage({
        size: "A4",
        margin: 0,
      });

      drawPageHeader(
        doc,
        order,
        invoiceNumber,
        logoPath
      );

      tableY = 180;
    }

    const totalsX = 335;
    const totalsWidth = 220;
    const totalsY = tableY;

    doc
      .rect(
        totalsX,
        totalsY,
        totalsWidth,
        100
      )
      .fillAndStroke(
        COLORS.cream,
        COLORS.border
      );

    const totalRows = [
      ["Subtotal", subtotal],
      ["Shipping Charge", shippingCharge],
      ["Discount", discount],
    ];

    let totalRowY = totalsY + 13;

    totalRows.forEach(([label, amount]) => {
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(COLORS.text)
        .text(
          label,
          totalsX + 18,
          totalRowY,
          {
            width: 100,
          }
        );

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(COLORS.text)
        .text(
          label === "Discount" && amount > 0
            ? `- ${formatCurrency(amount)}`
            : formatCurrency(amount),
          totalsX + 120,
          totalRowY,
          {
            width: 80,
            align: "right",
          }
        );

      totalRowY += 22;
    });

    doc
      .rect(
        totalsX,
        totalsY + 100,
        totalsWidth,
        42
      )
      .fillAndStroke(
        COLORS.softCream,
        COLORS.border
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.cocoaDark)
      .text(
        "TOTAL AMOUNT (INR)",
        totalsX + 18,
        totalsY + 114,
        {
          width: 125,
        }
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(COLORS.gold)
      .text(
        formatCurrency(finalAmount),
        totalsX + 138,
        totalsY + 111,
        {
          width: 64,
          align: "right",
        }
      );

    /*
     * Thank-you section
     */
    doc
      .font("Times-Bold")
      .fontSize(11)
      .fillColor(COLORS.cocoa)
      .text(
        "Thank you for shopping with Sharanee.",
        55,
        totalsY + 78,
        {
          width: 250,
        }
      );

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        "We truly appreciate your trust and support.",
        55,
        totalsY + 98,
        {
          width: 250,
        }
      );

    if (order.couponCode) {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(
          `Coupon applied: ${order.couponCode}`,
          55,
          totalsY + 118,
          {
            width: 250,
          }
        );
    }

    /*
     * Footer on every generated page
     */
    const pageRange = doc.bufferedPageRange();

    for (
      let pageIndex = pageRange.start;
      pageIndex <
      pageRange.start + pageRange.count;
      pageIndex += 1
    ) {
      doc.switchToPage(pageIndex);
      drawFooter(doc);
    }

    doc.end();
  }
);

module.exports = {
  downloadInvoice,
};