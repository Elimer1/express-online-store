import express from "express";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();
const dbBasePath = process.env.DB_BASE_PATH;
const router = express.Router();

router.get("/", async (req, res) => {
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
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to load products" });
  }
});

export default router;
