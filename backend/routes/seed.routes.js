const express = require("express");
const router = express.Router();

const db = require("../config/db");
const data = require("../data");
/* ================= SEED PRODUCTS ================= */
router.get("/seed-products", (req, res) => {
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
module.exports = router;