# express-online-store

This project is a backend API for a simulated online store, built with Express.js. It provides a system for managing an e-commerce backend without requiring a user authentication system. Key functionalities include managing a product catalog with filtering, tracking customer balances and individual shopping carts, and processing orders via a checkout flow that includes inventory validation and balance deduction. Data is persisted using local JSON files, with configuration managed through environment variables.

# required installations

this code requires node.js and express to run

run npm init -y and npm install express

# starting node.js

run npm start

# enpdoints

## API Endpoints

| Method   | Endpoint                             | Description                                |
| :------- | :----------------------------------- | :----------------------------------------- |
| `GET`    | `/`                                  | Short welcome message                      |
| `GET`    | `/health`                            | Server health check                        |
| `GET`    | `/products`                          | List all products (supports filtering)     |
| `GET`    | `/cart?customerId=abc123`            | Show cart for a specific customer          |
| `POST`   | `/cart/items`                        | Add product to cart                        |
| `DELETE` | `/cart/items/:productId`             | Remove product from cart                   |
| `GET`    | `/account/balance?customerId=abc123` | Show balance for a specific customer       |
| `POST`   | `/orders/checkout`                   | Finalize purchase and create order         |
| `GET`    | `/orders?customerId=abc123`          | Show order history for a specific customer |

# project structure

## Project Structure

This project is organized to separate API logic from data persistence:

```text
├── db/                 # JSON database files (customers, orders, products)
├── routes/             # API route handlers
│   ├── balance.js      # Account balance logic
│   ├── cart.js         # Cart management
│   ├── orders.js       # Checkout and order history
│   └── products.js     # Product listing and filtering
├── .env.example        # Environment variable template
├── package.json        # Dependencies and scripts
├── README.md           # Project documentation
└── server.js           # Main entry point for the server
```
