const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    Firstname: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    Lastname: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    phoneNumber: String,
    password: {
      type: String,
      required: true,
      min: 8,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    picture: {
      type: String,
      default: "",
    },
    thumbnail: { type: String, default: "" },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    role: {
      type: String,
      enum: ["user", "admin", "agent"],
      default: "user",
    },
    whitelist: {
      type: Array,
      default: [],
    },
    occupation: String,
    location: String,
    viewedProfile: Number,
    availableProperty: Number,
  },
  { timestamps: true }
);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Ensure user.tokens is initialized as an array
  if (!Array.isArray(user.tokens)) {
    user.tokens = [];
  }

  user.tokens.push({ token }); // or concat([{ token }])
  await user.save();

  return token;
};

// Add email normalization pre-save
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
