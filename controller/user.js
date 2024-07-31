import bcrypt from "bcryptjs";
import User from "../model/user.js";
import generateTokenAndSetCookie from "../utils/genrateTokenAndSetCookie.js";
import { generateReferralCode } from "../utils/generateReferal.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// User Register
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, referralCode } =
      req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      referralCode: generateReferralCode(email),
      referredBy: referralCode || null,
    });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        await referrer.save();
      }
    }

    if (newUser) {
      // Generate JWT token here
      await newUser.save();

      await sendEmail(
        newUser.email,
        "Welcome to ArtRader",
        `Dear ${newUser.firstName + " " + newUser.lastName},

Welcome to ArtRader We're delighted to inform you that your account has been successfully created. You are now part of our community.

Thank you for joining us. We look forward to serving you and providing you with a great experience.

Best regards,
ArtRader Team

Feel free to customize the placeholders like ArtRader,${newUser.firstName + " " + newUser.lastName
        }, and add any additional information or instructions that are relevant to your users.`
      );

      const token = await generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        token: token,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const token = await generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Logout User
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get user details
export const getUserDetails = (req, res) => {
  try {
    const user = req.user;

    console.log(user)

    res.status(200).json({ success: "user found", user });
  } catch (error) {
    console.log("Error in get user details controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(1000, 9999).toString();

    user.otp = otp;
    await user.save();

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is ${otp}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// verify otp
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  console.log(req.body);
  try {
    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// reset Password
export const resetPassword = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({ otp: req.body.otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //  const token = await generateTokenAndSetCookie(user._id, res);

    user.password = hashedPassword;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};


// update user roll
export const updateRoleSubscription = async (req, res) => {
  const { userId, role, subscription } = req.body;

  // console.log("Received userId:", userId);
  // console.log("Received role:", role);
  // console.log("Received subscription:", subscription);

  try {
    // find user by _id instead of userId
    const user = await User.findOne({ _id: userId });

    if (!user) {
      // If user is not found, respond with a 404 status code
      console.error(`User with ID ${userId} not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's role and subscription
    user.role = role;
    user.subscription = subscription;

    await user.save();

    console.log("Updated user:", user);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error in updateRoleSubscription:", error.message);
    res.status(500).send("Server error");
  }
};

