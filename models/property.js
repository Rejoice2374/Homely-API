const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["Duplex", "Studio", "Condo", "Office", "Shortlet", "Land"],
    },
    propertyDescription: {
      type: String,
      required: true,
      min: 10,
      max: 500,
    },
    leaseType: {
      type: String,
      required: true,
      enum: ["short-term rental", "long-term rental", "lease", "sale"],
    },
    leaseDuration: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly", "yearly", "permanent"],
    },
    propertyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyLocation: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    agentName: {
      type: String,
    },
    agentContact: {
      type: String,
    },
    agentImage: {
      type: String,
      default: "",
    },
    propertyImages: {
      type: [String],
      default: [],
    },
    propertyStatus: {
      type: String,
      enum: ["available", "rented", "sold", "under maintenance"],
      default: "available",
    },
    wishlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
