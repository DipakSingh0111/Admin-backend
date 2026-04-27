import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =======================
// Register Admin
// =======================
export const registerController = async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;

    // Validate fields
    if (!username || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin with this email or mobile already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      username,
      email,
      mobile,
      password: hashedPassword,
    });

    await newAdmin.save();

    // ✅ FIX: Token me _id add kiya
    const token = jwt.sign(
      {
        id: newAdmin._id,
        email: newAdmin.email,
        mobile: newAdmin.mobile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        mobile: newAdmin.mobile,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// =======================
// Login Admin
// =======================
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ FIX: Token me _id add kiya
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        mobile: admin.mobile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        mobile: admin.mobile,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
