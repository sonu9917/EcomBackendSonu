
import express from 'express';
import { handleWebhook } from '../controller/stripeController.js';

const WebhookRouter = express.Router();

// Use express.raw() to handle raw body for Stripe webhook verification
WebhookRouter.post('/webhook',express.raw({ type: 'application/json'}), handleWebhook);
export default WebhookRouter