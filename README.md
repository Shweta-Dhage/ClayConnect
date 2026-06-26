# ClayConnect

ClayConnect is a pottery marketplace web application designed to connect local potters with buyers through a simple online shopping experience. The platform includes separate flows for customers and potters, allowing users to browse pottery products and enabling potters to manage their own product listings.

## Features

### Customer Features
- Customer signup and login
- Browse pottery products by category
- Add to cart and Buy Now flow
- Checkout and order placement
- Razorpay payment integration

### Potter Features
- Potter signup and login
- Potter dashboard
- Add pottery products with image upload
- View own listed products
- Delete listed products

## Tech Stack
- Frontend HTML, CSS, JavaScript
- Backend Node.js, Express.js
- Database MySQL
- Other Tools  Libraries Razorpay, Multer, JWT, bcrypt

## Screenshots

### Home Page
![Home Page](Screenshots/home.png)

### Login Page
![Login](Screenshots/login.png)

### Customer Signup
![Customer Signup](Screenshots/customersignup.png)

### Potter Signup
![Potter Signup](Screenshots/pottersignup.png)

### Cart Page
![Cart](Screenshots/cart.png)

### Payment Page
![Payment](Screenshots/payment.png)

### Potter Dashboard
![Potter Dashboard](Screenshots/potterpage.png)

### Potter Products
![Potter Products](Screenshots/potterpage2.png)

### Contact Page
![Contact](Screenshots/contact.png)

## Project Structure

```bash
ClayConnect
│
├── backend
│   ├── server.js
│   ├── db.js
│   ├── data.js
│   ├── middleware
│   ├── routes
│   └── images
│
├── public
│   ├── index.html
│   ├── subtypes.html
│   ├── cart.html
│   ├── payment.html
│   ├── orders.html
│   ├── potters.html
│   ├── successful.html
│   ├── track.html
│   ├── script.js
│   ├── subtypes.js
│   ├── cart.js
│   ├── payment.js
│   ├── orders.js
│   ├── potters.js
│   └── style.css
│
├── uploads
├── package.json
└── README.md