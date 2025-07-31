const express = require("express");
const { verifyToken } = require("../middleware/auth");
const Wishlist = require("../models/Wishlist");
const Property = require("../models/property");

const router = express.Router();

// Add to wishlist
router.post("/add", verifyToken, async (req, res) => {
  const { propertyId } = req.body;
  const property = await Property.findById(propertyId);

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  try {
    const existing = await Wishlist.findOne({
      userId: req.user._id,
      propertyId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    const newWish = new Wishlist({
      userId: req.user._id,
      propertyId,
    });
    await newWish.save();

    // 👇 Add wishlist ID to property's wishlistedBy array
    property.wishlistedBy.push(newWish._id);
    await property.save();

    res.status(201).json(newWish);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete("/remove/:propertyId", verifyToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    const deleted = await Wishlist.findOneAndDelete({
      userId: req.user._id,
      propertyId: req.params.propertyId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    // 👇 Remove wishlist ID from property's wishlistedBy array
    property.wishlistedBy = property.wishlistedBy.filter(
      (id) => id.toString() !== deleted._id.toString()
    );
    await property.save();

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's wishlist
router.get("/", verifyToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user._id }).populate(
      "propertyId"
    );
    const properties = wishlist.map((item) => item.propertyId);
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
