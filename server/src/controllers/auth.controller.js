import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role, adminSecret } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json(new ApiResponse(false, "All fields are required"));
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json(new ApiResponse(false, "Email already registered"));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // role assignment
  let finalRole = "user";

  if (role === "admin") {
    const expectedSecret = process.env.ADMIN_SECRET?.trim();

    if (!expectedSecret) {
      return res.status(500).json(
        new ApiResponse(false, "ADMIN_SECRET not configured in server .env")
      );
    }

    if (!adminSecret || adminSecret.trim() !== expectedSecret) {
      return res.status(403).json(new ApiResponse(false, "Invalid admin secret"));
    }

    finalRole = "admin";
  }

  const user = await User.create({
    username,
    email,
    passwordHash,
    role: finalRole,
  });

  const token = signToken(user);
  return res.status(201).json(new ApiResponse(true, "Registered successfully", { token, user }));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(new ApiResponse(false, "Email and password are required"));
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json(new ApiResponse(false, "Invalid credentials"));

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json(new ApiResponse(false, "Invalid credentials"));

  const token = signToken(user);
  return res.status(200).json(new ApiResponse(true, "Login successful", { token, user }));
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  return res.status(200).json(new ApiResponse(true, "Profile", user));
});
