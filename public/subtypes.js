"use strict";

let allItems = [];
let cat = "";

window.onload = function () {

    cat = new URLSearchParams(window.location.search).get("cat");

    const grid = document.getElementById("grid");

    if (!cat) {
        grid.innerHTML = "<h2>Category Missing</h2>";
        return;
    }

    document.getElementById("heroTitle").innerText =
        cat.toUpperCase();

    document.getElementById("heroDesc").innerText =
        "Handmade clay collection";

    fetch(`http://localhost:5000/products?cat=${cat}`)
        .then(res => res.json())
        .then(data => {

            console.log(data);

            allItems = data;

            render(allItems);
        })
        .catch(err => {
            console.log(err);
            grid.innerHTML = "<h2>Server Error</h2>";
        });

    document.getElementById("search").addEventListener("input", e => {

        let val = e.target.value.toLowerCase();

        render(
            allItems.filter(i =>
                i.name.toLowerCase().includes(val)
            )
        );
    });

    document.getElementById("filter").addEventListener("change", e => {

        let arr = [...allItems];

        if (e.target.value === "low") {
            arr.sort((a, b) =>
                parseFloat(a.price.replace("₹", "")) -
                parseFloat(b.price.replace("₹", ""))
            );
        }

        if (e.target.value === "high") {
            arr.sort((a, b) =>
                parseFloat(b.price.replace("₹", "")) -
                parseFloat(a.price.replace("₹", ""))
            );
        }

        render(arr);
    });
};

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
            <img src="${item.img}">
            <div class="card-content">
                <h4>${item.name}</h4>
                <p class="price">${item.price}</p>
            </div>

            <div class="btns">
                <button class="add-btn">Add</button>
                <button class="buy-btn">Buy</button>
            </div>
        `;

        div.querySelector(".add-btn").onclick =
            () => addToCart(item);

        div.querySelector(".buy-btn").onclick =
            () => buyNow(item);

        grid.appendChild(div);
    });
}

function addToCart(item) {

    let user =
        JSON.parse(localStorage.getItem("user"));

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
    .then(() => {
        alert("Added to cart");
    });
}

function buyNow(item) {

    localStorage.setItem(
        "buyNowItem",
        JSON.stringify(item)
    );

    window.location.href = "payment.html";
}

function goCart() {
    window.location.href = "cart.html";
}