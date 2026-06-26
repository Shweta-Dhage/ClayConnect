"use strict";

let user = JSON.parse(localStorage.getItem("potter")) || {};

document.getElementById("welcome").innerText =
    "Welcome " + (user.name || "Potter") ;

document.getElementById("owner").innerText =
    user.name || "Potter";

/* ================= TOAST ================= */

function showToast(msg, type = "success") {

    const toast = document.getElementById("toast");

    toast.innerText = msg;

    toast.className = "";

    toast.classList.add("show");
    toast.classList.add(type);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* ================= LOAD PRODUCTS ================= */

function loadProducts() {

    fetch(`http://localhost:5000/my-products?email=${user.email}`)
    .then(res => res.json())

    .then(products => {

        document.getElementById("count").innerText =
            products.length;

        let list = document.getElementById("list");

        list.innerHTML = "";

        products.forEach((p) => {
            const imgUrl = p.img
            ? (p.img.startsWith("http")
            ? p.img
            : `http://localhost:5000/uploads/${p.img.replace(/^uploads[\\/]/, "")}`)
            : "http://localhost:5000/uploads/default.png";

            list.innerHTML += `

            <div class="card">

                <img src="${imgUrl}" alt="${p.name}">

                <div class="card-body">

                    <span class="badge">
                        ${p.category}
                    </span>

                    <h3>${p.name}</h3>

                    <div class="price">
                        ₹${p.price}
                    </div>

                    <p>
                        ${p.description || ""}
                    </p>

                    <button
                    class="delete"
                    onclick="deletePot(${p.id})">
                        Delete Product
                    </button>

                </div>

            </div>

            `;
        });

    })

    .catch(() => {
        showToast("Products load failed ❌", "error");
    });
}

/* ================= ADD PRODUCT ================= */

function addProduct() {

    let name =
        document.getElementById("name").value;

    let price =
        document.getElementById("price").value;

    let imgFile =
        document.getElementById("img").files[0];

    let desc =
        document.getElementById("desc").value;

    let category =
        document.getElementById("category").value;

    if (!name || !price) {

        showToast("Fill all fields ❌", "error");
        return;
    }

    let formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("description", desc);
    formData.append("potter_email", user.email);

    if (imgFile) {
        formData.append("img", imgFile);
    }

    fetch(
        "http://localhost:5000/add-product",
        {
            method: "POST",
            body: formData
        }
    )

    .then(res => res.json())

    .then(data => {

        showToast(data.message);

        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("desc").value = "";
        document.getElementById("img").value = "";

        loadProducts();
    })

    .catch(() => {
        showToast("Product add failed ❌", "error");
    });
}

/* ================= DELETE ================= */

function deletePot(id) {

    fetch(
        "http://localhost:5000/delete-product",
        {
            method: "DELETE",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
    id,
    email: user.email
})
        }
    )

    .then(res => res.json())

    .then(data => {

        showToast(data.message);

        loadProducts();
    })

    .catch(() => {
        showToast("Delete failed ❌", "error");
    });
}

/* ================= LOGOUT ================= */

function logout() {

    localStorage.removeItem("potter");
    localStorage.removeItem("token");

    window.location.href = "index.html";
}

/* ================= START ================= */

loadProducts();                                   