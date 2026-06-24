require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const data = require("./data");

const verifyToken = require("./middleware/auth.middleware");
const checkRole = require("./middleware/role.middleware");
const SECRET_KEY = process.env.JWT_SECRET;
const app = express();
/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/images", express.static(path.join(__dirname, "images")));
/* ================= IMAGE UPLOAD ================= */
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Fill all fields ❌" });
    }

    db.query("SELECT * FROM users WHERE email=?", [email], async (err, users) => {
        if (users?.length > 0) {
            const match = await bcrypt.compare(password, users[0].password);

            if (match) {
                const token = jwt.sign(
                    {
                        id: users[0].id,
                        email: users[0].email,
                        role: "customer"
                    },
                    SECRET_KEY,
                    { expiresIn: "1d" }
                );

                return res.json({
                    success: true,
                    role: "customer",
                    user: users[0],
                    token
                });
            }
        }

        db.query("SELECT * FROM potters WHERE email=?", [email], async (err, potters) => {
            if (potters?.length > 0) {
                const match = await bcrypt.compare(password, potters[0].password);

                if (match) {
                    const token = jwt.sign(
                        {
                            id: potters[0].id,
                            email: potters[0].email,
                            role: "potter"
                        },
                        SECRET_KEY,
                        { expiresIn: "1d" }
                    );

                    return res.json({
                        success: true,
                        role: "potter",
                        user: potters[0],
                        token
                    });
                }
            }

            return res.json({
                success: false,
                message: "Invalid Email or Password ❌"
            });
        });
    });
});

/* ================= SIGNUP ================= */
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Fill all fields ❌" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: "Invalid Email ❌" });
    }

    const passRegex = /^(?=.*[0-9]).{6,}$/;
    if (!passRegex.test(password)) {
        return res.json({
            success: false,
            message: "Password must contain number and min 6 chars ❌"
        });
    }

    db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
        if (result?.length > 0) {
            return res.json({ success: false, message: "Email already exists ❌" });
        }

        const hash = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users(name,email,password) VALUES(?,?,?)",
            [name, email, hash],
            () => res.json({ success: true, message: "Signup successful ✅" })
        );
    });
});

/* ================= POTTER SIGNUP ================= */
app.post("/signup-potter", async (req, res) => {
    const { name, email, studio, exp, password } = req.body;

    if (!name || !email || !studio || !exp || !password) {
        return res.json({ success: false, message: "Fill all fields ❌" });
    }

    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name)) {
        return res.json({ success: false, message: "Name only letters ❌" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: "Invalid Email ❌" });
    }

    if (studio.length < 3) {
        return res.json({ success: false, message: "Studio too short ❌" });
    }

    if (isNaN(exp) || exp < 0 || exp > 50) {
        return res.json({ success: false, message: "Invalid experience ❌" });
    }

    const passRegex = /^(?=.*[0-9]).{6,}$/;
    if (!passRegex.test(password)) {
        return res.json({ success: false, message: "Weak password ❌" });
    }

    db.query("SELECT * FROM potters WHERE email=?", [email], async (err, result) => {
        if (result?.length > 0) {
            return res.json({ success: false, message: "Email exists ❌" });
        }

        const hash = await bcrypt.hash(password, 10);

        db.query(
            `INSERT INTO potters (name,email,studio,experience,password)
             VALUES (?,?,?,?,?)`,
            [name, email, studio, exp, hash],
            () => res.json({ success: true, message: "Potter registered ✅" })
        );
    });
});

/* ================= PRODUCTS ================= */
app.get("/products", (req, res) => {
    const cat = req.query.cat?.toLowerCase();

    db.query(
        "SELECT * FROM products WHERE category=?",
        [cat],
        (err, dbProducts) => {
            if (err) return res.json([]);

            const formatted = (dbProducts || []).map(p => {
                let imgUrl = "http://localhost:5000/uploads/default.png";

                if (p.img) {
                    if (p.img.startsWith("http")) {
                        imgUrl = p.img;
                    } 
                    else if (p.img.includes("uploads/") || p.img.includes("uploads\\")) {
                        imgUrl = `http://localhost:5000/${p.img.replace(/\\/g, "/")}`;
                    } 
                    else if (
                        p.img.includes("images/") ||
                        p.img.includes("images\\") ||
                        p.img.startsWith("./images")
                    ) {
                        imgUrl = `http://localhost:5000/images/${p.img.replace(/^(\.\/|\.\\)?images[\\/]/, "")}`;
                    } 
                    else {
                        imgUrl = `http://localhost:5000/uploads/${p.img}`;
                    }
                }

                return {
                    id: p.id,
                    name: p.name,
                    price: "₹" + p.price,
                    img: imgUrl,
                    description: p.description,
                    owner: p.owner_email,
                    category: p.category
                };
            });

            res.json(formatted);
        }
    );
});

/* ================= SEED PRODUCTS FIX ================= */
app.get("/seed-products", (req, res) => {
    let allProducts = [];

    Object.keys(data).forEach(category => {
        data[category].forEach(item => {
            allProducts.push([
                item.name,
                Number(item.price.replace("₹", "")),
                category,
                item.img,
                item.info,
                item.store || "Clay Connect"
            ]);
        });
    });

    db.query(
        `INSERT INTO products
        (name, price, category, img, description, owner_email)
        VALUES ?`,
        [allProducts],
        (err) => {
            if (err) {
                console.log(err);
                return res.json({ message: "Error ❌" });
            }

            return res.json({
                message: `${allProducts.length} products inserted ✅`
            });
        }
    );
});

/* ================= CART ROUTES ================= */

// GET CART
app.get("/cart", (req, res) => {

    const email = req.query.email;

    db.query(`
        SELECT 
            c.id,
            c.qty,
            p.id AS product_id,
            p.name,
            p.price,
            p.img
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_email=?
    `, [email], (err, result) => {

        if (err) return res.status(500).json([]);

        res.json(result);
    });
});

// ADD TO CART
app.post("/cart", (req, res) => {
    const { user_email, product_id } = req.body;

    db.query(
        "INSERT INTO cart (user_email, product_id, qty) VALUES (?, ?, 1)",
        [user_email, product_id],
        (err) => {
            if (err) {
                console.log(err);
                return res.json({ success: false });
            }
            res.json({ success: true });
        }
    );
});

// DELETE FROM CART
app.delete("/delete-product", (req, res) => {

    const { id, email } = req.body;

    if (!id || !email) {
        return res.json({
            success: false,
            message: "Missing product or user ❌"
        });
    }

    db.query(
        "DELETE FROM products WHERE id=? AND owner_email=?",
        [id, email],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Delete failed ❌"
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: "Not allowed to delete this product ❌"
                });
            }

            res.json({
                success: true,
                message: "Deleted ✅"
            });
        }
    );
});

app.post("/place-order", (req, res) => {

    const {
        name,
        phone,
        address,
        items,
        total,
        payment_id,
        payment_status
    } = req.body;

    if (!name || !phone || !address) {
        return res.json({
            success: false,
            message: "Missing fields"
        });
    }

    const sql = `
        INSERT INTO orders
        (name, phone, address, items, total, payment_id, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        name,
        phone,
        address,
        JSON.stringify(items),
        total,
        payment_id,
        payment_status
    ], (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB insert failed"
            });
        }

        res.json({
            success: true,
            message: "Order placed"
        });
    });
});

// ADD PRODUCT
app.post("/add-product", upload.single("img"), (req, res) => {

    const {
        name,
        price,
        category,
        description,
        potter_email
    } = req.body;

    const img = req.file ? req.file.filename : null;

    if (!name || !price || !category || !potter_email) {
        return res.json({
            success: false,
            message: "Missing fields ❌"
        });
    }

    const sql = `
        INSERT INTO products
        (name, price, category, img, description, owner_email)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        name,
        price,
        category,
        img,
        description,
        potter_email
    ], (err) => {

        if (err) {
            console.log(err);
            return res.json({
                success: false,
                message: "DB error ❌"
            });
        }

        res.json({
            success: true,
            message: "Product added ✅"
        });
    });
});
// POTTER PRODUCTS
app.get("/my-products", (req, res) => {

    const email = req.query.email;

    db.query(
        "SELECT * FROM products WHERE owner_email=?",
        [email],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json([]);
            }

            res.json(result);
        }
    );
});
// DELETE PRODUCT
app.delete("/delete-product", (req, res) => {

    const { id } = req.body;

    db.query(
        "DELETE FROM products WHERE id=?",
        [id],
        (err) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Delete failed ❌"
                });
            }

            res.json({
                success: true,
                message: "Deleted ✅"
            });
        }
    );
});

app.get("/orders", (req, res) => {

    db.query("SELECT * FROM orders ORDER BY id DESC", (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json([]);
        }

        res.json(result);
    });
});
/* ================= START ================= */
app.listen(5000, () => {
    console.log("Server running 🚀 http://localhost:5000");
});