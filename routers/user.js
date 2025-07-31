const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { verifyToken } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// User login
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect credentials" });
    }

    const token = await user.generateAuthToken();
    res.json({
      success: true,
      user: {
        _id: user._id,
        Firstname: user.Firstname,
        Lastname: user.Lastname,
        email: user.email,
        role: user.role,
        picture: user.picture,
        thumbnail: user.thumbnail,
        whitelist: user.whitelist, // include correct field
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Logout
router.post("/logout", verifyToken, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// Get user profile
router.get("/me", verifyToken, async (req, res) => {
  res.send(req.user);
});

// Get user whitelist
router.get("/me/whitelists", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const whitelistUsers = await Promise.all(
      user.whitelist.map(async (id) => {
        const u = await User.findById(id);
        return {
          _id: u._id,
          Firstname: u.Firstname,
          Lastname: u.Lastname,
          email: u.email,
          picture: u.picture,
        };
      })
    );
    res.send(whitelistUsers);
  } catch (error) {
    console.error("Error fetching whitelist:", error);
    res.status(500).send({ error: "Failed to get whitelist" });
  }
});

// Update whitelist (toggle add/remove)
router.patch("/me/:whitelistId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const target = await User.findById(req.params.whitelistId);
    if (!target) return res.status(404).json({ error: "User not found" });

    const alreadyAdded = user.whitelist.includes(target._id.toString());

    if (alreadyAdded) {
      user.whitelist = user.whitelist.filter(
        (id) => id.toString() !== target._id.toString()
      );
      target.whitelist = target.whitelist.filter(
        (id) => id.toString() !== user._id.toString()
      );
    } else {
      user.whitelist.push(target._id);
      target.whitelist.push(user._id);
    }

    await user.save();
    await target.save();

    const updatedWhitelist = await Promise.all(
      user.whitelist.map(async (id) => {
        const u = await User.findById(id);
        return {
          _id: u._id,
          Firstname: u.Firstname,
          Lastname: u.Lastname,
          email: u.email,
          picture: u.picture,
        };
      })
    );

    res.send(updatedWhitelist);
  } catch (error) {
    console.error("Whitelist update error:", error);
    res.status(500).json({ error: "Failed to update whitelist" });
  }
});

// Update profile
router.patch("/me", verifyToken, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = [
    "Firstname",
    "Lastname",
    "email",
    "password",
    "occupation",
    "location",
  ];
  const isValid = updates.every((key) => allowed.includes(key));
  if (!isValid) return res.status(400).send({ error: "Invalid updates" });

  try {
    updates.forEach((key) => (req.user[key] = req.body[key]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user
router.delete("/me", verifyToken, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

// Logout all sessions
router.post("/logoutAll", verifyToken, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
