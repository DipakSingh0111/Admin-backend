import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Admin
// =======================

export const registerController = async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { mobile }] });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email or mobile already exists" });
    }
    // hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate JWT Token
    const token = jwt.sign({ email, mobile }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create new admin
    const newAdmin = new Admin({
      username,
      email,
      mobile,
      password: hashedPassword,
    });
    await newAdmin.save();

    res
      .status(201)
      .json({ message: "Admin registered successfully", token, newAdmin });
  } catch (error) {
    res.status(404).json({ message: "Admin not found" });
  }
};

// Login Admin
// =======================

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { email: admin.email, mobile: admin.mobile },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    //   Return success response with token
    res.status(200).json({ message: "Admin logged in successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
