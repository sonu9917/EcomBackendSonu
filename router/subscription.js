
import express from "express";
import { handleSubscriptionCancelled } from "../controller/subscription.js";

const subscriptionRoutes = express.Router();

// Route for handling subscription cancellation
subscriptionRoutes.post("/cancel", handleSubscriptionCancelled);

export default subscriptionRoutes;
