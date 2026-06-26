"use strict";

let cart = [];
let user = JSON.parse(localStorage.getItem("user"));

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

/* ================= IMAGE  ================= */
function fixImg(img) {
    if (!img) return "http://localhost:5000/uploads/default.png";
    if (img.startsWith("http")) return img;
    return "http://localhost:5000/" + img.replace(/\\/g, "/");
}

/* ================= PRICE  ================= */
function getPrice(price) {
    if (!price) return 0;

    if (typeof price === "string") {
        price = price.replace("₹", "");
    }

    return Number(price) || 0;
}

/* ================= LOAD CART ================= */
function loadCart() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    if (!user) {
        container.innerHTML = "<h3 class='empty'>Login Required ❌</h3>";
        return;
    }

    fetch("http://localhost:5000/cart?email=" + user.email)
        .then(res => res.json())
        .then(data => {
            cart = data.map(item => ({
                id: item.id, // cart row id
                product_id: item.product_id,
                name: item.name,
                img: item.img,
                qty: item.qty || 1,
                price: getPrice(item.price)
            }));

            renderCart();
        })
        .catch(() => {
            container.innerHTML = "<h3 class='empty'>Cart Error ❌</h3>";
        });
}

/* ================= UPDATE CART QTY ================= */
function updateCartQty(productId, qty) {
    return fetch("http://localhost:5000/cart", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_email: user.email,
            product_id: productId,
            qty: qty
        })
    }).then(res => res.json());
}

/* ================= RENDER CART ================= */
function renderCart() {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<h3 class='empty'>Cart is empty 🛒</h3>";
        updateSummary();
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-card";

        div.innerHTML = `
            <img src="${fixImg(item.img)}">

            <div class="cart-info">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>

                <div class="qty-box">
                    <button class="minus">-</button>
                    <span>${item.qty}</span>
                    <button class="plus">+</button>
                </div>

                <button class="remove-btn">Remove</button>
            </div>
        `;

        /* ================= REMOVE ================= */
        div.querySelector(".remove-btn").onclick = () => {
            removeItem(item.product_id);
        };

        /* ================= MINUS ================= */
        div.querySelector(".minus").onclick = () => {
            if (item.qty > 1) {
                const newQty = item.qty - 1;

                updateCartQty(item.product_id, newQty)
                    .then(data => {
                        if (data.success) {
                            cart[index].qty = newQty;
                            renderCart();
                        } else {
                            alert(data.message || "Qty update failed ❌");
                        }
                    })
                    .catch(() => alert("Qty update failed ❌"));
            } else {
                removeItem(item.product_id);
            }
        };

        /* ================= PLUS ================= */
        div.querySelector(".plus").onclick = () => {
            const newQty = item.qty + 1;

            updateCartQty(item.product_id, newQty)
                .then(data => {
                    if (data.success) {
                        cart[index].qty = newQty;
                        renderCart();
                    } else {
                        alert(data.message || "Qty update failed ❌");
                    }
                })
                .catch(() => alert("Qty update failed ❌"));
        };

        container.appendChild(div);
    });

    updateSummary();
}

/* ================= REMOVE ITEM ================= */
function removeItem(productId) {
    fetch("http://localhost:5000/cart", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_email: user.email,
            product_id: productId
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadCart();
            } else {
                alert(data.message || "Remove failed ❌");
            }
        })
        .catch(() => alert("Remove failed ❌"));
}

/* ================= SUMMARY ================= */
function updateSummary() {
    const totalItemsEl = document.getElementById("totalItems");
    const totalPriceEl = document.getElementById("totalPrice");

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;
    });

    if (totalItemsEl) totalItemsEl.innerText = totalItems;
    if (totalPriceEl) totalPriceEl.innerText = "₹" + totalPrice;
}

/* ================= CHECKOUT ================= */
function checkout() {
    if (cart.length === 0) {
        alert("Cart Empty ❌");
        return;
    }

    localStorage.setItem("checkoutItems", JSON.stringify(cart));
    window.location.href = "payment.html";
}