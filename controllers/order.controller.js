import Product from "../models/order.model.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addProduct = async (req, res) => {
  try {
    const { name, description, category, productPrice, offerPrice } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
      }));
    }

    const product = await Product.create({
      name,
      description,
      category,
      productPrice: Number(productPrice),
      offerPrice: Number(offerPrice) || 0,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    // Remove uploaded files if DB save fails
    if (req.files) {
      req.files.forEach((file) => {
        const filePath = path.join(__dirname, "../uploads", file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to add product",
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get all products
// @route   GET /api/products
// @access  Public
// ─────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.productPrice = {};
      if (minPrice) filter.productPrice.$gte = Number(minPrice);
      if (maxPrice) filter.productPrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// ─────────────────────────────────────────
// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
// ─────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// ─────────────────────────────────────────
// @desc    Update product by ID
// @route   PUT /api/products/:id
// @access  Public
// ─────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, category, productPrice, offerPrice } = req.body;

    // If new images uploaded, delete old ones and replace
    let images = product.images;
    if (req.files && req.files.length > 0) {
      // Delete old images from disk
      product.images.forEach((img) => {
        const filePath = path.join(__dirname, "../uploads", img.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name || product.name,
        description: description || product.description,
        category: category || product.category,
        productPrice:
          productPrice !== undefined
            ? Number(productPrice)
            : product.productPrice,
        offerPrice:
          offerPrice !== undefined ? Number(offerPrice) : product.offerPrice,
        images,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ─────────────────────────────────────────
// @desc    Delete product by ID
// @route   DELETE /api/products/:id
// @access  Public
// ─────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete associated images from disk
    product.images.forEach((img) => {
      const filePath = path.join(__dirname, "../uploads", img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

export {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
