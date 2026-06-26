const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

//  env check
if (!DB_USER || !DB_NAME) {
    console.log("DB config missing ❌ Check .env file");
}

const db = mysql.createConnection({
    host: DB_HOST || "localhost",
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("DB Error ❌", err.message);
    } else {
        console.log("MySQL Connected ✅");
    }
});

module.exports = db;