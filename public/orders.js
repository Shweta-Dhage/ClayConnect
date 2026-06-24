"use strict";

/* ================= CONFIG ================= */
const API = "http://localhost:5000";

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadOrders);

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
    const box = document.getElementById("orders");
    if (!box) return;

    box.innerHTML = "Loading orders... ⏳";

    try {
        const res = await fetch(`${API}/orders`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            box.innerHTML = "<h3>No orders found 😢</h3>";
            return;
        }

        box.innerHTML = "";

        data.forEach(order => {
            box.appendChild(createOrderCard(order));
        });

    } catch (err) {
        console.error("Orders load error:", err);
        box.innerHTML = "<h3>Server error ❌</h3>";
    }
}

/* ================= ORDER CARD ================= */
function createOrderCard(order) {

    const div = document.createElement("div");
    div.className = "order-card";

    let items = [];

    try {
        items = JSON.parse(order.items || "[]");
    } catch {
        items = [];
    }

    const itemsHTML = items.length
        ? items.map(i => `
            <li>${i.name || "Item"} (x${i.qty || 1})</li>
        `).join("")
        : "<li>No items</li>";

    div.innerHTML = `
        <div class="order-header">
            <h3>👤 ${escapeHTML(order.name || "Unknown")}</h3>
            <span class="order-id">#${order.id}</span>
        </div>

        <p>📞 ${escapeHTML(order.phone || "-")}</p>
        <p>📍 ${escapeHTML(order.address || "-")}</p>

        <div class="order-items">
            <h4>Items:</h4>
            <ul>${itemsHTML}</ul>
        </div>

        <div class="order-footer">
            <b>💰 Total: ₹${order.total || 0}</b>
        </div>
    `;

    return div;
}

/* ================= SECURITY FIX ================= */
function escapeHTML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}