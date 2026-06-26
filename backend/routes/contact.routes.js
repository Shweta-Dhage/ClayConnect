const express = require("express");
const router = express.Router();

const db = require("../config/db");
/* ================= CONTACT ================= */
router.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.json({
            success: false,
            message: "Fill all fields ❌"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({
            success: false,
            message: "Invalid email ❌"
        });
    }

    const sql = `
        INSERT INTO contacts (name, email, message)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [name, email, message], (err) => {
        if (err) {
            console.log("Contact Error ❌", err);
            return res.status(500).json({
                success: false,
                message: "Message not sent ❌"
            });
        }

        return res.json({
            success: true,
            message: "Message sent successfully ✅"
        });
    });
});
module.exports = router;