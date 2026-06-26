const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../config/db");

const SECRET_KEY = process.env.JWT_SECRET;


/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
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
router.post("/signup", async (req, res) => {
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
        if (err) {
            console.log("Signup check error ❌", err);
            return res.status(500).json({
                success: false,
                message: "Signup failed ❌"
            });
        }

        if (result?.length > 0) {
            return res.json({ success: false, message: "Email already exists ❌" });
        }

        const hash = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users(name,email,password) VALUES(?,?,?)",
            [name, email, hash],
            (err) => {
                if (err) {
                    console.log("Signup Error ❌", err);
                    return res.status(500).json({
                        success: false,
                        message: "Signup failed ❌"
                    });
                }

                return res.json({
                    success: true,
                    message: "Signup successful ✅"
                });
            }
        );
    });
});

/* ================= POTTER SIGNUP ================= */
router.post("/signup-potter", async (req, res) => {
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
    (err) => {
        if (err) {
            console.log("Potter Signup Error ❌", err);
            return res.status(500).json({
                success: false,
                message: "Potter signup failed ❌"
            });
        }

        return res.json({
            success: true,
            message: "Potter registered ✅"
        });
    }
);
    });
});

module.exports = router;