const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const cloudinary = require("../cloudinary.js");

// REGISTER USER
const register = async (req, res) => {
  try {
    const user = new User(req.body);

    if (req.file && req.file.path) {
      // ✅ Store original image URL
      user.picture = req.file.path;

      // ✅ Get Cloudinary public_id from the secure_url
      const publicId = req.file.filename;

      // ✅ Generate thumbnail URL
      const thumbnailUrl = cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: "thumb",
        gravity: "face",
      });

      user.thumbnail = thumbnailUrl;
    }

    await user.save();

    // Generate JWT
    const token = await user.generateAuthToken();

    console.log("✅ Uploaded to Cloudinary:", req.file?.path);
    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(400).json({ error: error.message, stack: error.stack });
  }
};

// VERIFY TOKEN
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = {
  register,
  verifyToken,
};
