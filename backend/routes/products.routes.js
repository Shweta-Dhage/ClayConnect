const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const db = require("../config/db");
const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");
const formatProductImage = require("../utils/image.util");

/* ================= PRODUCTS ================= */
router.get("/products", (req, res) => {
    const cat = req.query.cat?.toLowerCase();

    let sql = "SELECT * FROM products";
    let values = [];

    if (cat) {
        sql += " WHERE category=?";
        values.push(cat);
    }

    db.query(sql, values, (err, dbProducts) => {
        if (err) {
            console.log(err);
            return res.json([]);
        }

        const formatted = (dbProducts || []).map(p => ({
            id: p.id,
            name: p.name,
            price: "₹" + p.price,
            img: formatProductImage(p.img),
            description: p.description,
            owner: p.owner_email,
            category: p.category
        }));

        res.json(formatted);
    });
});
// ADD PRODUCT
router.post("/add-product", upload.single("img"), (req, res) => {

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
router.get("/my-products", (req, res) => {

    const email = req.query.email;

    if (!email) return res.json([]);

    db.query(
        "SELECT * FROM products WHERE owner_email=? ORDER BY id DESC",
        [email],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json([]);
            }

            const formatted = (result || []).map(p => ({
                ...p,
                img: formatProductImage(p.img)
            }));

            res.json(formatted);
        }
    );
});
// DELETE PRODUCT
router.delete("/delete-product", (req, res) => {

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
module.exports = router;