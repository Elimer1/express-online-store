import express from "express";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const dbBasePath = process.env.DB_BASE_PATH;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { customerId } = req.query;
    const fileData = await fs.readFile(`${dbBasePath}/customers.json`, "utf8");
    const customers = JSON.parse(fileData);

    const customer = customers.find(
      (customer) => customer.customerId === customerId,
    );
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: "customer not found" });
    }

    return res.status(200).json({ success: true, data: customer.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "internal server error" });
  }
});

export default router;
