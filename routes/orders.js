import express from "express";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const dbBasePath = process.env.DB_BASE_PATH;
const router = express.Router();

router.post("/checkout", async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, error: "missing customer id" });
    }
    const customerData = await fs.readFile(`${dbBasePath}/customers.json`);
    const customers = JSON.parse(customerData);
    const customer = customers.find((customer) => customer.id === customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "customer not found" });
    }

    if (!customer.cart.length) {
      return res.status(400).json({ success: false, error: "cart is empty" });
    }

    const productData = await fs.readFile(`${dbBasePath}/products.json`);
    const products = JSON.parse(productData);

    let total = 0;
    for (const item of customer.cart) {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `${product.name ? `${product.name} is no longer available` : "product not found"} `,
        });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ success: false, error: "not enough stock" });
      }

      total += product.price * item.quantity;
    }

    if (customer.balance < total) {
      return res.status(400).json({
        succes: false,
        error: "not enough funds to complete the purchase",
      });
    }

    customer.balance -= total;

    const items = [];
    for (const item of customer.cart) {
      const product = products.find((product) => product.id === item.productId);

      product.stock -= item.quantity;

      items.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const ordersData = await fs.readFile(`${dbBasePath}/orders.json`);
    const orders = JSON.parse(ordersData);
    const id =
      orders.length > 0
        ? Math.max(...orders.map((order) => Number(order.id))) + 1
        : 1;

    const order = {
      id,
      customerId,
      items,
      total,
      createdAt: new Date().toISOString(),
    };

    customer.cart = [];

    orders.push(order);

    await fs.writeFile(
      `${dbBasePath}/orders.json`,
      JSON.stringify(orders, null, 2),
    );
    await fs.writeFile(
      `${dbBasePath}/customers.json`,
      JSON.stringify(customers, null, 2),
    );
    await fs.writeFile(
      `${dbBasePath}/products.json`,
      JSON.stringify(products, null, 2),
    );

    res.status(200).json({
      success: true,
      message: `order number #${order.id} complted successfully`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "internal server error" });
  }
});
