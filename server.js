import express from "express";
import dotenv from "dotenv";
import fs from "fs/promises";

const server = express();
dotenv.config();

const port = process.env.PORT;
const dbBasePath = process.env.DB_BASE_PATH;
const startingBalance = process.env.STARTING_BALANCE;

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

    const fileData = await fs.readFile(`${dbBasePath}/products.json`);
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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
