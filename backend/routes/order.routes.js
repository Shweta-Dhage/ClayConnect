const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.post("\place-order", (req, res) => {

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

router.get("/orders", (req, res) => {

    db.query("SELECT * FROM orders ORDER BY id DESC", (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json([]);
        }

        res.json(result);
    });
});
module.exports = router;