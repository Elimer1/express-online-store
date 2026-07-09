import express from "express";
import dotenv from "dotenv";
import fs from "fs/promises";
import cartRoutes from "./routes/cart.js";
import productRoutes from "./routes/products.js";

const server = express();
dotenv.config();

const port = process.env.PORT;
const dbBasePath = process.env.DB_BASE_PATH;
const startingBalance = process.env.STARTING_BALANCE;

// Add this line BEFORE your app.post() or server.post() routes
server.use(express.json());

server.get("/", (req, res) => {
  res.json({ message: "welcome to this server" });
});

server.get("/health", (req, res) => {
  res.json({ message: "server is working" });
});

server.use("/products", productRoutes);

server.use("/cart", cartRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
