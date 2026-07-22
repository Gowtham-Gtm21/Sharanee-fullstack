// Run with: npm run seed
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");

const run = async () => {
  await connectDB();

  // --- Admin user ---
  const adminEmail = "admin@sharanee.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      fullName: "Sharanee Admin",
      email: adminEmail,
      phone: "9999999999",
      password: "Admin@123",
      role: "admin",
    });
    console.log(`Admin created -> email: ${adminEmail}  password: Admin@123`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // --- Categories ---
  const categoryNames = ["Silk Sarees", "Cotton Sarees", "Wedding Collection", "Festive Wear"];
  const categories = {};
  for (const name of categoryNames) {
    let cat = await Category.findOne({ categoryName: name });
    if (!cat) cat = await Category.create({ categoryName: name, description: `${name} by Sharanee` });
    categories[name] = cat;
  }
  console.log(`Categories ready: ${categoryNames.join(", ")}`);

  // --- Sample products ---
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    await Product.insertMany([
      {
        productName: "Kanjivaram Silk Saree - Maroon",
        description: "Handwoven Kanjivaram silk saree with gold zari border.",
        category: categories["Silk Sarees"]._id,
        price: 12999,
        discountPrice: 10999,
        stock: 12,
        fabric: "Silk",
        color: "Maroon",
        occasion: "Wedding",
        size: ["Free Size"],
        featured: true,
      },
      {
        productName: "Handloom Cotton Saree - Blue",
        description: "Lightweight handloom cotton saree, perfect for everyday elegance.",
        category: categories["Cotton Sarees"]._id,
        price: 2499,
        discountPrice: 0,
        stock: 30,
        fabric: "Cotton",
        color: "Blue",
        occasion: "Casual",
        size: ["Free Size"],
        featured: false,
      },
      {
        productName: "Bridal Zari Saree - Red",
        description: "Rich bridal saree with intricate zari work, ideal for weddings.",
        category: categories["Wedding Collection"]._id,
        price: 24999,
        discountPrice: 21999,
        stock: 4,
        fabric: "Silk Blend",
        color: "Red",
        occasion: "Wedding",
        size: ["Free Size"],
        featured: true,
      },
      {
        productName: "Festive Georgette Saree - Green",
        description: "Flowy georgette saree with sequin work for festive occasions.",
        category: categories["Festive Wear"]._id,
        price: 4599,
        discountPrice: 3999,
        stock: 0,
        fabric: "Georgette",
        color: "Green",
        occasion: "Festive",
        size: ["Free Size"],
        featured: false,
      },
    ]);
    console.log("Sample products created.");
  } else {
    console.log("Products already exist, skipping sample product creation.");
  }

  console.log("\nSeed complete.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
