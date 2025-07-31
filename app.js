const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { register, verifyToken } = require("./middleware/auth");

require("./db/mongoose");

const User = require("./models/user");
const Property = require("./models/property");
const Wishlist = require("./models/Wishlist");

const {
  router: propertyRouter,
  uploadProperty,
} = require("./routers/property");
const wishlistRouter = require("./routers/wishlist");
const cartRouter = require("./routers/cart");
const userRouter = require("./routers/user");

// CONFIGURATION
dotenv.config();
const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// FILE STORAGE
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req) =>
      req.originalUrl.includes("property") ? "properties" : "profile_pictures",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
  //
});

// ROUTES
app.get("/", (req, res) => {
  res.send("Hello World welcome to my first express app");
});
app.post("/api/upload", upload.single("picture"), register);
app.post(
  "/api/property/upload",
  verifyToken,
  upload.array("pictures", 8),
  uploadProperty
);
app.use("/api/user", userRouter);
app.use("/api/property", propertyRouter);
app.use("/api/wishlist", wishlistRouter);
// app.use("/api/cart", cartRouter);

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// MONGOOSE + SERVER START
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
