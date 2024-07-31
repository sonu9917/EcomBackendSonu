// server/controllers/subscriptionController.js

import Checkout from "../model/checkout.js";
import User from "../model/user.js";
import sendEmail from "../utils/sendEmail.js";

export const handleSubscriptionCancelled = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from request

    // Find the checkout session with the given userId
    const checkout = await Checkout.findOne({ userId }).populate("userId");

    if (!checkout) {
      console.error("Checkout session not found in database");
      return res.status(404).json({ message: "Checkout session not found" });
    }

    // Get Stripe Customer ID from Checkout
    const customerId = checkout.stripeCustomerId;

    // Optionally, you could also verify the customer's subscription status with Stripe here if needed

    // Update user subscription details
    const user = await User.findById(userId);
    user.role = "user"
    user.subscription = null; // Clear subscription details
    await user.save();

    // Update checkout status
    checkout.status = "canceled";
    checkout.membershipPrice = 0; // Update price
    checkout.membershipType = 'none';
    checkout.expirationDate = 0;
    checkout.paymentIntentId = '';
    checkout.paymentStatus = 'success';
    checkout.purchaseDate = 0;
    checkout.stripeCustomerId = '';

    await checkout.save();

    // Send a cancellation email to the user
    await sendEmail(
      user.email,
      "Membership Cancelled",
      `<h1>Membership Cancelled</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We're sorry to see you go! Your membership for ${checkout.membershipType} has been successfully cancelled.</p>
        <p>If you have any questions or need further assistance, please feel free to contact us.</p>
        <p>Thank you for being with us.</p>` 
    );

    console.log("Subscription cancellation handling complete");
    return res.status(200).json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error handling customer.subscription.deleted:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
