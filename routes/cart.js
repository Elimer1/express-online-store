import express from "express";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const dbBasePath = process.env.DB_BASE_PATH;
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(400).json({ success: false, error: "missing customer id" });
});

router.get("/:customerId", async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const fileData = await fs.readFile(`${dbBasePath}/customers.json`);
    const customers = JSON.parse(fileData);
    const customer = customers.find((customer) => customer.id === customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "customer not found" });
    }
    return res.status(200).json({ success: true, data: customer.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "internal server error" });
  }
});

router.post("/items", async (req, res) => {
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

router.delete("/items/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { customerId } = req.body;
    const fileData = await fs.readFile(`${dbBasePath}/customers.json`);
    const customers = JSON.parse(fileData);
    const customer = customers.find((customer) => customer.id === customerId);
    if (!customer) {
      return res
        .status(400)
        .json({ success: false, error: "customer not found" });
    }
    const itemCount = customer.cart.length;

    customer.cart = customer.cart.filter(
      (item) => item.productId !== productId,
    );

    if (customer.cart.length === itemCount) {
      return res
        .status(404)
        .json({ success: false, error: "item was not in the cart" });
    }

    await fs.writeFile(
      `${dbBasePath}/customers.json`,
      JSON.stringify(customers, null, 2),
    );
    res
      .status(200)
      .json({ success: true, message: "item deleted from cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "internal server error" });
  }
});

export default router;
