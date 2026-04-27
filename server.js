import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import admin from "./routes/admin.route.js";
import productRoutes from "./routes/product.route.js";

// dotenv
dotenv.config();

// connect Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "https://client-admin-peach.vercel.app/login",
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Routes
app.use("/api/admin", admin);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Admin API");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
}

export default app;
