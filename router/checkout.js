import express from 'express';
import { createCheckoutSession, getAllCheckout, getInvoice} from '../controller/checkout.js';
import protectRoute from '../middleware/protectRoute.js';

const CheckoutRouter = express.Router();

CheckoutRouter.post('/create-checkout-session',protectRoute,createCheckoutSession);
CheckoutRouter.get('/getAllCheckout',getAllCheckout)
CheckoutRouter.post('/get-invoice',getInvoice)


export default CheckoutRouter;
