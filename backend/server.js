const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const db = require("./config/db");
const formatProductImage = require("./utils/image.util");
const orderRoutes = require("./routes/order.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const contactRoutes = require("./routes/contact.routes");
const seedRoutes = require("./routes/seed.routes");
const cartRoutes = require("./routes/cart.routes");
const express = require("express");
const cors = require("cors");
const data = require("./data");

const app = express();
/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cartRoutes);
app.use(productRoutes);
app.use(authRoutes);
app.use(orderRoutes);
app.use(contactRoutes);
app.use(seedRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(__dirname, "images")));

/* ================= START ================= */
app.listen(5000, () => {
    console.log("Server running 🚀 http://localhost:5000");
});