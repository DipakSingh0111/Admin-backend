import express from "express";
import {} from "../controllers/order.controller.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/order.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST   /api/products        → Add new product (with up to 4 images)
router.post("/", upload.array("images", 4), addProduct);

// GET    /api/products        → Get all products (with filters & pagination)
router.get("/", getAllProducts);

// GET    /api/products/:id    → Get single product
router.get("/:id", getProductById);

// PUT    /api/products/:id    → Update product (optionally replace images)
router.put("/:id", upload.array("images", 4), updateProduct);

// DELETE /api/products/:id    → Delete product (removes images too)
router.delete("/:id", deleteProduct);

export default router;
