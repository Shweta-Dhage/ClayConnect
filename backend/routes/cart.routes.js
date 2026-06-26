const express = require("express");
const router = express.Router();

const db = require("../config/db");
const formatProductImage = require("../utils/image.util");

// GET CART
router.get("/cart", (req, res) => {

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

        const formatted = (result || []).map(item => ({
            ...item,
            img: formatProductImage(item.img)
        }));

        res.json(formatted);
    });
});
// ADD TO CART
router.post("/cart", (req, res) => {
    const { user_email, product_id } = req.body;

    if (!user_email || !product_id) {
        return res.json({ success: false, message: "Missing fields ❌" });
    }

    db.query(
        "SELECT * FROM cart WHERE user_email=? AND product_id=?",
        [user_email, product_id],
        (err, rows) => {
            if (err) {
                console.log(err);
                return res.json({ success: false, message: "Cart failed ❌" });
            }

            if (rows && rows.length > 0) {
                db.query(
                    "UPDATE cart SET qty = qty + 1 WHERE user_email=? AND product_id=?",
                    [user_email, product_id],
                    (err2) => {
                        if (err2) {
                            console.log(err2);
                            return res.json({ success: false, message: "Cart update failed ❌" });
                        }

                        return res.json({ success: true, message: "Cart updated ✅" });
                    }
                );
            } else {
                db.query(
                    "INSERT INTO cart (user_email, product_id, qty) VALUES (?, ?, 1)",
                    [user_email, product_id],
                    (err3) => {
                        if (err3) {
                            console.log(err3);
                            return res.json({ success: false, message: "Cart add failed ❌" });
                        }

                        return res.json({ success: true, message: "Added to cart ✅" });
                    }
                );
            }
        }
    );
});

// UPDATE CART QTY
router.put("/cart", (req, res) => {
    const { user_email, product_id, qty } = req.body;

    if (!user_email || !product_id || qty === undefined) {
        return res.json({
            success: false,
            message: "Missing fields ❌"
        });
    }

    const newQty = Number(qty);

    if (isNaN(newQty) || newQty < 1) {
        return res.json({
            success: false,
            message: "Invalid quantity ❌"
        });
    }

    db.query(
        "UPDATE cart SET qty=? WHERE user_email=? AND product_id=?",
        [newQty, user_email, product_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Cart qty update failed ❌"
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: "Cart item not found ❌"
                });
            }

            return res.json({
                success: true,
                message: "Cart qty updated ✅"
            });
        }
    );
});

// DELETE FROM CART
router.delete("/cart", (req, res) => {
    const { user_email, product_id } = req.body;

    if (!user_email || !product_id) {
        return res.json({
            success: false,
            message: "Missing fields ❌"
        });
    }

    db.query(
        "DELETE FROM cart WHERE user_email=? AND product_id=?",
        [user_email, product_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Cart delete failed ❌"
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    message: "Item not found in cart ❌"
                });
            }

            return res.json({
                success: true,
                message: "Item removed from cart ✅"
            });
        }
    );
});
module.exports = router;