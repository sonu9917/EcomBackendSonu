import mongoose from "mongoose";

// Define the schema for User
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subscription: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    otp:{
      type:Number,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin","super-admin"], // Assuming there might be roles like 'user' and 'admin'
    },
    referralCode: String,
    referredBy: String,
    wallet: { type: Number, default: 0 },
    walletCredited: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Create the model from the schema
const User = mongoose.model("User", userSchema);

export default User;
