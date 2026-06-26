"use strict";

let allItems = [];
let cat = "";

window.onload = function () {
    const grid = document.getElementById("grid");
    const searchEl = document.getElementById("search");
    const filterEl = document.getElementById("filter");
    const heroTitle = document.getElementById("heroTitle");
    const heroDesc = document.getElementById("heroDesc");

    cat = new URLSearchParams(window.location.search).get("cat");

    // Hero text
    heroTitle.innerText = cat ? cat.toUpperCase() : "ALL PRODUCTS";
    heroDesc.innerText = "Handmade clay collection";

    // Fetch products
    let url = "http://localhost:5000/products";
    if (cat) {
        url += `?cat=${encodeURIComponent(cat)}`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            allItems = Array.isArray(data) ? data : [];
            applyFilters();
        })
        .catch(err => {
            console.log(err);
            grid.innerHTML = "<h2>Server Error</h2>";
        });

    // Search
    searchEl.addEventListener("input", applyFilters);

    // Sort filter
    filterEl.addEventListener("change", applyFilters);
};

function applyFilters() {
    const grid = document.getElementById("grid");
    const searchEl = document.getElementById("search");
    const filterEl = document.getElementById("filter");

    let val = searchEl.value.trim().toLowerCase();
    let filtered = [...allItems];

    // Search filter
    if (val) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(val)
        );
    }

    // Sort filter
    if (filterEl.value === "low") {
        filtered.sort((a, b) =>
            Number(a.price.replace("₹", "")) -
            Number(b.price.replace("₹", ""))
        );
    }

    if (filterEl.value === "high") {
        filtered.sort((a, b) =>
            Number(b.price.replace("₹", "")) -
            Number(a.price.replace("₹", ""))
        );
    }

    render(filtered);
}

function render(items) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    if (!items.length) {
        grid.innerHTML = "<h2>No products found</h2>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="card-content">
                <h4>${item.name}</h4>
                <p class="price">${item.price}</p>
            </div>

            <div class="btns">
                <button class="add-btn">Add</button>
                <button class="buy-btn">Buy</button>
            </div>
        `;

        div.querySelector(".add-btn").onclick = () => addToCart(item);
        div.querySelector(".buy-btn").onclick = () => buyNow(item);

        grid.appendChild(div);
    });
}

function addToCart(item) {
    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login required");
        return;
    }

    fetch("http://localhost:5000/cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_email: user.email,
            product_id: item.id
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message || "Added to cart");
            } else {
                alert(data.message || "Failed to add to cart");
            }
        })
        .catch(err => {
            console.log(err);
            alert("Server error");
        });
}

function buyNow(item) {
    localStorage.setItem("buyNowItem", JSON.stringify(item));
    window.location.href = "payment.html";
}

function goCart() {
    window.location.href = "cart.html";
}