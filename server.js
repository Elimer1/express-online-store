import express from "express";
import dotenv from "dotenv";
import fs from "fs/promises";
import { json } from "stream/consumers";

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

server.get("/products", async (req, res) => {
  try {
    const { inStock, maxPrice, search } = req.query;

    let maxPriceInt = null;
    if (maxPrice) {
      maxPriceInt = Number(maxPrice);
      if (isNaN(maxPriceInt) || maxPriceInt < 0) {
        return res
          .status(400)
          .json({ success: false, message: "invalid max price" });
      }
    }
    const searchToLower = search ? search.toLowerCase() : null;

    const fileData = await fs.readFile(`${dbBasePath}/products.json`, "utf8");
    const data = JSON.parse(fileData);
    let filteredData = data;

    if (inStock === "true") {
      filteredData = filteredData.filter((product) => product.stock > 0);
    }
    if (maxPriceInt !== null) {
      filteredData = filteredData.filter(
        (product) => product.price <= maxPriceInt,
      );
    }
    if (searchToLower) {
      filteredData = filteredData.filter((product) =>
        product.name.toLowerCase().includes(searchToLower),
      );
    }

    res.json({ success: true, data: filteredData });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to load products" });
  }
});

server.post("/cart/items", async (req, res) => {
  const { customerId, productId, quantity } = req.body;

  try {
    if (!customerId || !productId || !quantity) {
      return res
        .status(400)
        .json({ success: false, ERROR: "incomplete data received" });
    }

    const pId = Number(productId);
    const quant = Number(quantity);

    if (typeof customerId !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "customer id must be alphanumeric" });
    }

    if (!Number.isInteger(pId) || pId <= 0) {
      return res.status(400).json({
        success: false,
        error: "product id must be a number greater than 0",
      });
    }

    if (quant <= 0) {
      return res.status(400).json({
        success: false,
        error: "quantity must be a number greater than 0",
      });
    }

    const fileData = await fs.readFile(`${dbBasePath}/products.json`, "utf8");
    const products = JSON.parse(fileData);
    const product = products.find((p) => p.id === pId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "product not found" });
    }

    if (!product.stock) {
      return res
        .status(400)
        .json({ success: false, error: "Product is out of stock." });
    }

    if (product.stock < quant) {
      return res
        .status(400)
        .json({ success: false, error: "Insufficient stock available." });
    }

    const customers = JSON.parse(
      await fs.readFile(`${dbBasePath}/customers.json`),
    );
    let customer = customers.find((customer) => customer.id === customerId);

    if (!customer) {
      customer = { id: customerId, cart: [] };
      customers.push(customer);
    }

    const itemInCart = customer.cart.find((item) => item.productId === pId);
    if (itemInCart) {
      itemInCart.quantity += quant;
    } else {
      customer.cart.push({ productId: pId, quantity: quant });
    }

    await fs.writeFile(
      `${dbBasePath}/customers.json`,
      JSON.stringify(customers, null, 2),
    );

    return res
      .status(200)
      .json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "internal server error" });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
