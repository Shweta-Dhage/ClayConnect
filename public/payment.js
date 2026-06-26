"use strict";

/* ================= LOAD CART ================= */

let cart = JSON.parse(localStorage.getItem("checkoutItems")) || [];

/* BUY NOW  */
if (cart.length === 0) {

    let buyItem =
        JSON.parse(localStorage.getItem("buyNowItem"));

    if (buyItem) {
        cart = [buyItem];
    }
}

let user = JSON.parse(localStorage.getItem("user"));

document.addEventListener("DOMContentLoaded", () => {
    renderOrder();
});

/* ================= PRICE ================= */

function getPrice(price) {

    if (!price) return 0;

    return parseFloat(
        String(price)
        .replace(/[₹,]/g, "")
    ) || 0;
}

/* ================= RENDER ORDER ================= */

function renderOrder() {

    const container =
        document.getElementById("orderItems");

    let totalItems = 0;
    let totalPrice = 0;

    container.innerHTML = "";

    if (cart.length === 0) {

        container.innerHTML =
            "<p>Cart Empty ❌</p>";

        document.getElementById("totalItems").innerText = 0;
        document.getElementById("totalPrice").innerText = "₹0";

        return;
    }

    cart.forEach(item => {

        let price = getPrice(item.price);
        let qty = item.qty || 1;

        totalItems += qty;
        totalPrice += price * qty;

        container.innerHTML += `
            <div class="order-card">
                <p><b>${item.name}</b></p>
                <p>Qty: ${qty}</p>
                <p>₹${price * qty}</p>
            </div>
        `;
    });

    document.getElementById("totalItems").innerText =
        totalItems;

    document.getElementById("totalPrice").innerText =
        "₹" + totalPrice;
}

/* ================= PAY NOW ================= */

function payNow() {

    let name =
        document.getElementById("name").value.trim();

    let phone =
        document.getElementById("phone").value.trim();

    let address =
        document.getElementById("address").value.trim();

    if (!name || !phone || !address) {

        alert("Fill all details ❌");
        return;
    }

    let total = 0;

    cart.forEach(item => {

        total +=
            getPrice(item.price) *
            (item.qty || 1);
    });

    const options = {

        key: "rzp_test_T4dTTxH8u4xA6V",

        amount: total * 100,

        currency: "INR",

        name: "Clay Connect",

        description: "Pottery Order",

        handler: function (response) {

            createOrder(
                name,
                phone,
                address,
                total,
                response.razorpay_payment_id
            );
        }
    };

    const rzp = new Razorpay(options);

    rzp.open();
}

/* ================= CREATE ORDER ================= */

function createOrder(
    name,
    phone,
    address,
    total,
    paymentId
) {

    fetch("http://localhost:5000/place-order", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            name,
            phone,
            address,
            items: cart,
            total,
            payment_id: paymentId,
            payment_status: "Paid"
        })
    })

    .then(res => res.json())

    .then(async () => {

        /* DELETE ITEMS FROM DATABASE CART */

        if (user) {

            for (let item of cart) {

                await fetch(
                    "http://localhost:5000/cart",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                            "application/json"
                        },

                        body: JSON.stringify({
                            user_email: user.email,
                            product_id: item.product_id || item.id
                        })
                    }
                );
            }
        }

        /* CLEAR STORAGE */

        localStorage.removeItem(
            "checkoutItems"
        );

        localStorage.removeItem(
            "cart"
        );

        localStorage.removeItem(
            "buyNowItem"
        );

        /* SUCCESS PAGE */

        window.location.href =
            "successful.html?payment=" +
            paymentId;
    })

    .catch(() => {

        alert("Order failed ❌");
    });
}