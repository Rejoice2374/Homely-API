const express = require("express");
const { verifyToken } = require("../middleware/auth.js");
const Property = require("../models/property.js");
const User = require("../models/user.js");
const cloudinary = require("../cloudinary");
const streamifier = require("streamifier");

const router = express.Router();

// Cloudinary configuration
const uploadToCloudinary = (fileBuffer, folderName = "properties") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    console.log("Uploading image to Cloudinary...");
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Create a new property
const uploadProperty = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files uploaded." });
    }

    const imageUrls = req.files.map((file) => file.path); // multer-storage-cloudinary gives you .path

    // Get user from DB to extract agent details
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const property = new Property({
      ...req.body,
      userId: user._id,
      propertyImages: imageUrls,
      agentName: `${user.Firstname} ${user.Lastname}`,
      agentContact: user.email || user.phone || "",
      agentImage: user.picture || "",
    });

    await property.save();

    // 👇 Add property ID to user's properties array
    user.properties.push(property._id);
    await user.save();

    res.status(201).json(property);
  } catch (error) {
    console.error("Property upload error:", error);
    res.status(500).json({ message: "Failed to create property." });
  }
};

// Get all available properties
router.get("/", async (req, res) => {
  try {
    const property = await Property.find({ propertyStatus: "available" });
    if (property.length === 0) {
      return res.status(404).json({ error: "No properties found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error.message });
  }
});

// Get properties by user ID
router.get("/myproperty", verifyToken, async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user._id });

    if (properties.length === 0) {
      return res.status(404).json({ error: "No products found for this user" });
    }
    res.status(200).json(properties);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Get a property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Add/Remove property from wishlist
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the property ID from the URL.
    const { userId } = req.body; // Extract the user ID from the request body (who is wishlisting).

    const property = await Property.findById(id); // Fetch the property from the database using the ID.

    if (!property) {
      // If no property is found, return a 404 error.
      return res.status(404).json({ error: "Property not found" });
    }

    // Make sure the 'wishlistedBy' field exists and is an object.
    // If it doesn't exist yet (undefined), initialize it as an empty object.
    property.wishlistedBy = property.wishlistedBy || {};

    // Check if this user has already wishlisted the property.
    // This accesses the property like: wishlistedBy["userId"].
    // If true, it means the user has wishlisted it before.
    const isWishlisted = property.wishlistedBy[userId] || false;

    if (isWishlisted) {
      // If it's already wishlisted, remove the user from the wishlist.
      delete property.wishlistedBy[userId];
    } else {
      // If it's not wishlisted, add the user to the wishlist.
      property.wishlistedBy[userId] = true;
    }

    // Save the updated property document to the database.
    const updatedProperty = await property.save();

    // Respond with the updated property.
    res.status(200).json(updatedProperty);
  } catch (error) {
    // If any error occurs (e.g., DB or logic error), log it and return a 400 response.
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// Update a property by ID
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a property by ID
router.delete("/:id", async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Export the router
module.exports = {
  router,
  uploadProperty,
};
