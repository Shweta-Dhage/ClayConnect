const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/role");

// ADD PRODUCT
router.post("/add", verifyToken, checkRole("potter"), (req, res) => {

    const { name, price, category, img, info } = req.body;
    
    const potter_id = req.user.id;

    if (!name || !price || !category) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const sql = `
        INSERT INTO products 
        (name, price, category, img, info, potter_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, price, category, img, info, potter_id], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });

        res.json({
            message: "Product added",
            id: result.insertId
        });
    });
});

// GET ALL
router.get("/", (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) return res.status(500).json([]);
        res.json(result);
    });
});

// DELETE (SECURE)
router.delete("/:id", verifyToken, checkRole("potter"), (req, res) => {

    const id = req.params.id;
    const userId = req.user.id;

    db.query("SELECT * FROM products WHERE id=?", [id], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ message: "Not found" });
        }

        if (result[0].potter_id !== userId) {
            return res.status(403).json({ message: "Not allowed" });
        }

        db.query("DELETE FROM products WHERE id=?", [id], (err) => {
            if (err) return res.status(500).json({ message: "Delete failed" });

            res.json({ message: "Deleted" });
        });
    });
});

module.exports = router;