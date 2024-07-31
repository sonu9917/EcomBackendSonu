import { Router } from "express";
import { createPayoutCustomer, createUserPayout } from "../controller/payout.js";

const PayoutRouter = Router()

PayoutRouter.post('/create-customer', createPayoutCustomer)
PayoutRouter.post('/create-payout',createUserPayout)

export default PayoutRouter