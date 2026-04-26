import express from "express";
import {
  loginController,
  registerController,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Admin login route
router.post("/register", registerController);
router.post("/login", loginController);

export default router;
