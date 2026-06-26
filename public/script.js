"use strict";

// ================= MODALS =================
function openLogin() {
    document.getElementById("loginModal").style.display = "flex";
}

function openSignupChoice() {
    document.getElementById("signupChoiceModal").style.display = "flex";
}

function openCustomerSignup() {
    closeModal();
    document.getElementById("customerModal").style.display = "flex";
}

function openPotterSignup() {
    closeModal();
    document.getElementById("potterModal").style.display = "flex";
}

function openContact() {
    document.getElementById("contactModal").style.display = "flex";
}

function closeModal() {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}


// ================= LOGIN =================
function loginUser(){

    let email = document.getElementById("loginUser").value.trim();
    let password = document.getElementById("loginPass").value.trim();

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    document.getElementById("login_email_error").innerText="";
    document.getElementById("login_pass_error").innerText="";

    if(!email){
        document.getElementById("login_email_error").innerText =
        "Enter email ❌";
        return;
    }

    if(!emailPattern.test(email)){
        document.getElementById("login_email_error").innerText =
        "Invalid email ❌";
        return;
    }

    if(!password){
        document.getElementById("login_pass_error").innerText =
        "Enter password ❌";
        return;
    }

    if(password.length < 6){
        document.getElementById("login_pass_error").innerText =
        "Minimum 6 characters ❌";
        return;
    }

    fetch("http://localhost:5000/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    })
    .then(res => res.json())
    .then(data => {

        if(data.success && data.role === "customer"){

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "token",
                data.token
            );

            alert("Customer Login ✅");

            closeModal();

            updateCartCount();
        }

        else if(data.success && data.role === "potter"){

            localStorage.setItem(
                "potter",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "token",
                data.token
            );

            alert("Potter Login ✅");

            window.location.href = "potters.html";
        }

        else{
            document.getElementById("login_pass_error").innerText =
            "Invalid Email or Password ❌";
        }

    });
}

// ================= CATEGORY =================
function openCategory(cat){
    window.location.href = "subtypes.html?cat=" + cat;
}


// ================= CONTACT =================
function sendMessage(){

    let name = document.getElementById("cname").value.trim();
    let email = document.getElementById("cemail").value.trim();
    let msg = document.getElementById("cmsg").value.trim();

    let namePattern = /^[A-Za-z ]+$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    document.getElementById("contact_name_error").innerText="";
    document.getElementById("contact_email_error").innerText="";
    document.getElementById("contact_msg_error").innerText="";

    let valid = true;

    if(!name){
        document.getElementById("contact_name_error").innerText =
        "Enter name ❌";
        valid = false;
    }
    else if(!namePattern.test(name)){
        document.getElementById("contact_name_error").innerText =
        "Only letters allowed ❌";
        valid = false;
    }

    if(!email){
        document.getElementById("contact_email_error").innerText =
        "Enter email ❌";
        valid = false;
    }
    else if(!emailPattern.test(email)){
        document.getElementById("contact_email_error").innerText =
        "Invalid email ❌";
        valid = false;
    }

    if(!msg){
        document.getElementById("contact_msg_error").innerText =
        "Enter message ❌";
        valid = false;
    }

    if(!valid) return;

    fetch("http://localhost:5000/contact",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            name,
            email,
            message: msg
        })
    })
    .then(res=>res.json())
    .then(data=>{

        alert(data.message);

        closeModal();

        document.getElementById("cname").value="";
        document.getElementById("cemail").value="";
        document.getElementById("cmsg").value="";
    });
}


// ================= CART COUNT  =================
function updateCartCount(){

    let user = JSON.parse(localStorage.getItem("user"));
    let el = document.getElementById("cartCount");

    if(!el) return;

    if(!user){
        el.innerText = 0;
        return;
    }

    fetch("http://localhost:5000/cart?email=" + user.email)
    .then(res=>res.json())
    .then(cart=>{
        el.innerText = cart.length || 0;
    })
    .catch(()=>{
        el.innerText = 0;
    });
}

updateCartCount();


// ================= CART ADD  =================
function addToCart(item){

    let user = JSON.parse(localStorage.getItem("user"));

    if(!user){
        alert("Login required ❌");
        return;
    }

    fetch("http://localhost:5000/cart",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            user_email: user.email,
            product_id: item.id
        })
    })
    .then(res=>res.json())
    .then(()=>{
        alert("Added to cart 🛒");
        updateCartCount();
    })
    .catch(()=> alert("Cart error ❌"));
}


// ================= BUY NOW =================
function buyNow(item){
    localStorage.setItem("buyNowItem", JSON.stringify(item));
    window.location.href = "payment.html";
}


// ================= HERO SLIDER =================
let heroImages = document.querySelectorAll("#heroSlider img");
let index = 0;

function showHero(i){
    heroImages.forEach(img => img.classList.remove("active"));
    if(heroImages[i]) heroImages[i].classList.add("active");
}

function nextSlide(){
    index++;
    if(index >= heroImages.length) index = 0;
    showHero(index);
}

setInterval(nextSlide,3000);

function prevSlide(){
    index--;

    if(index < 0){
        index = heroImages.length - 1;
    }

    showHero(index);
}

function scrollLeft() {
    let slider = document.getElementById("slider");

    slider.scrollBy({
        left: -270,
        behavior: "smooth"
    });
}

function scrollRight() {
    let slider = document.getElementById("slider");

    slider.scrollBy({
        left: 270,
        behavior: "smooth"
    });
}
setInterval(() => {
    scrollRight();

    let slider = document.getElementById("slider");

    if (
        slider.scrollLeft + slider.clientWidth >=
        slider.scrollWidth - 5
    ) {
        slider.scrollLeft = 0;
    }
}, 3000);


// ================= REVIEWS =================
function submitReview(name){

    let review = event.target.previousElementSibling.value;

    if(!review){
        alert("Write something ❌");
        return;
    }

    let reviews = JSON.parse(localStorage.getItem("reviews")) || {};

    if(!reviews[name]) reviews[name] = [];

    reviews[name].push(review);

    localStorage.setItem("reviews", JSON.stringify(reviews));

    alert("Review added ✅");
}

// ================= SIGNUP CUSTOMER =================
function registerCustomer(){

    let name = document.getElementById("c_name").value.trim();
    let email = document.getElementById("c_email").value.trim();
    let phone = document.getElementById("c_phone").value.trim();
    let password = document.getElementById("c_pass").value.trim();

    let namePattern = /^[A-Za-z ]+$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phonePattern = /^[0-9]{10}$/;
    let passPattern = /^(?=.*[0-9]).{6,}$/;

    document.getElementById("c_name_error").innerText="";
    document.getElementById("c_email_error").innerText="";
    document.getElementById("c_phone_error").innerText="";
    document.getElementById("c_pass_error").innerText="";

    let valid = true;

    if(!name){
        document.getElementById("c_name_error").innerText =
        "Enter name ❌";
        valid = false;
    }
    else if(!namePattern.test(name)){
        document.getElementById("c_name_error").innerText =
        "Only letters allowed ❌";
        valid = false;
    }

    if(!email){
        document.getElementById("c_email_error").innerText =
        "Enter email ❌";
        valid = false;
    }
    else if(!emailPattern.test(email)){
        document.getElementById("c_email_error").innerText =
        "Invalid email ❌";
        valid = false;
    }

    if(!phone){
        document.getElementById("c_phone_error").innerText =
        "Enter phone number ❌";
        valid = false;
    }
    else if(!phonePattern.test(phone)){
        document.getElementById("c_phone_error").innerText =
        "Enter 10 digits ❌";
        valid = false;
    }

    if(!password){
        document.getElementById("c_pass_error").innerText =
        "Enter password ❌";
        valid = false;
    }
    else if(!passPattern.test(password)){
        document.getElementById("c_pass_error").innerText =
        "Password must contain number ❌";
        valid = false;
    }

    if(!valid) return;

    fetch("http://localhost:5000/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        if(data.success){

            closeModal();

            document.getElementById("c_name").value="";
            document.getElementById("c_email").value="";
            document.getElementById("c_phone").value="";
            document.getElementById("c_pass").value="";
        }
    });
}
// ================= SIGNUP POTTER =================
function registerPotter(){

    let name = document.getElementById("p_name").value.trim();
    let email = document.getElementById("p_email").value.trim();
    let studio = document.getElementById("p_studio").value.trim();
    let exp = document.getElementById("p_exp").value.trim();
    let password = document.getElementById("p_pass").value.trim();

    let namePattern = /^[A-Za-z ]+$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let passPattern = /^(?=.*[0-9]).{6,}$/;
    let expPattern = /^[0-9]+$/;

    document.getElementById("p_name_error").innerText="";
    document.getElementById("p_email_error").innerText="";
    document.getElementById("p_studio_error").innerText="";
    document.getElementById("p_exp_error").innerText="";
    document.getElementById("p_pass_error").innerText="";

    if(!namePattern.test(name)){
        document.getElementById("p_name_error").innerText =
        "Only letters allowed ❌";
        return;
    }

    if(!emailPattern.test(email)){
        document.getElementById("p_email_error").innerText =
        "Invalid email ❌";
        return;
    }

    if(studio.length < 3){
        document.getElementById("p_studio_error").innerText =
        "Minimum 3 letters ❌";
        return;
    }

    if(!expPattern.test(exp)){
        document.getElementById("p_exp_error").innerText =
        "Numbers only ❌";
        return;
    }

    if(Number(exp) > 50){
        document.getElementById("p_exp_error").innerText =
        "Invalid experience ❌";
        return;
    }

    if(!passPattern.test(password)){
        document.getElementById("p_pass_error").innerText =
        "Password must contain number ❌";
        return;
    }

    fetch("http://localhost:5000/signup-potter",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            name,
            email,
            studio,
            exp,
            password
        })
    })
    .then(res => res.json())
    .then(data => {

        alert(data.message);

        if(data.success){

            closeModal();

            document.getElementById("p_name").value="";
            document.getElementById("p_email").value="";
            document.getElementById("p_studio").value="";
            document.getElementById("p_exp").value="";
            document.getElementById("p_pass").value="";
        }
    });
}

// ================= VALIDATIONS =================

// LOGIN
document.getElementById("loginUser").addEventListener("input", function () {
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(this.value.trim() === ""){
        document.getElementById("login_email_error").innerText =
        "Enter email ❌";
    }
    else if(!emailPattern.test(this.value)){
        document.getElementById("login_email_error").innerText =
        "Invalid email ❌";
    }
    else{
        document.getElementById("login_email_error").innerText = "";
    }
});

document.getElementById("loginPass").addEventListener("input", function () {

    if(this.value.length < 6){
        document.getElementById("login_pass_error").innerText =
        "Minimum 6 characters ❌";
    }
    else{
        document.getElementById("login_pass_error").innerText = "";
    }
});

// CUSTOMER NAME
document.getElementById("c_name").addEventListener("input", function () {

    let pattern = /^[A-Za-z ]*$/;

    if(!pattern.test(this.value)){
        document.getElementById("c_name_error").innerText =
        "Only letters allowed ❌";
    }
    else{
        document.getElementById("c_name_error").innerText = "";
    }
});

// CUSTOMER EMAIL
document.getElementById("c_email").addEventListener("input", function () {

    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(this.value && !pattern.test(this.value)){
        document.getElementById("c_email_error").innerText =
        "Invalid email ❌";
    }
    else{
        document.getElementById("c_email_error").innerText = "";
    }
});

// CUSTOMER PHONE
document.getElementById("c_phone").addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, '');

    if(this.value.length > 10){
        this.value = this.value.slice(0,10);
    }

    if(this.value.length > 0 && this.value.length < 10){
        document.getElementById("c_phone_error").innerText =
        "Enter 10 digits ❌";
    }
    else{
        document.getElementById("c_phone_error").innerText = "";
    }
});

// CUSTOMER PASSWORD
document.getElementById("c_pass").addEventListener("input", function () {

    let pattern = /^(?=.*[0-9]).{6,}$/;

    if(this.value && !pattern.test(this.value)){
        document.getElementById("c_pass_error").innerText =
        "Minimum 6 characters & 1 number ❌";
    }
    else{
        document.getElementById("c_pass_error").innerText = "";
    }
});

// POTTER NAME
document.getElementById("p_name").addEventListener("input", function () {

    let pattern = /^[A-Za-z ]*$/;

    if(!pattern.test(this.value)){
        document.getElementById("p_name_error").innerText =
        "Only letters allowed ❌";
    }
    else{
        document.getElementById("p_name_error").innerText = "";
    }
});

// POTTER EMAIL
document.getElementById("p_email").addEventListener("input", function () {

    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(this.value && !pattern.test(this.value)){
        document.getElementById("p_email_error").innerText =
        "Invalid email ❌";
    }
    else{
        document.getElementById("p_email_error").innerText = "";
    }
});

// STUDIO NAME
document.getElementById("p_studio").addEventListener("input", function () {

    if(this.value.length > 0 && this.value.length < 3){
        document.getElementById("p_studio_error").innerText =
        "Minimum 3 letters ❌";
    }
    else{
        document.getElementById("p_studio_error").innerText = "";
    }
});

// EXPERIENCE
document.getElementById("p_exp").addEventListener("input", function () {

    this.value = this.value.replace(/\D/g,'');

    if(Number(this.value) > 50){
        document.getElementById("p_exp_error").innerText =
        "Maximum 50 years ❌";
    }
    else{
        document.getElementById("p_exp_error").innerText = "";
    }
});

// POTTER PASSWORD
document.getElementById("p_pass").addEventListener("input", function () {

    let pattern = /^(?=.*[0-9]).{6,}$/;

    if(this.value && !pattern.test(this.value)){
        document.getElementById("p_pass_error").innerText =
        "Minimum 6 characters & 1 number ❌";
    }
    else{
        document.getElementById("p_pass_error").innerText = "";
    }
});

// CONTACT NAME
document.getElementById("cname").addEventListener("input", function () {

    let pattern = /^[A-Za-z ]*$/;

    if(!pattern.test(this.value)){
        document.getElementById("contact_name_error").innerText =
        "Only letters allowed ❌";
    }
    else{
        document.getElementById("contact_name_error").innerText = "";
    }
});

// CONTACT EMAIL
document.getElementById("cemail").addEventListener("input", function () {

    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(this.value && !pattern.test(this.value)){
        document.getElementById("contact_email_error").innerText =
        "Invalid email ❌";
    }
    else{
        document.getElementById("contact_email_error").innerText = "";
    }
});

// MESSAGE
document.getElementById("cmsg").addEventListener("input", function () {

    if(this.value.length < 5 && this.value.length > 0){
        document.getElementById("contact_msg_error").innerText =
        "Minimum 5 characters ❌";
    }
    else{
        document.getElementById("contact_msg_error").innerText = "";
    }
});            