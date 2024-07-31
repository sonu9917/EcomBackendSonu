import express from "express";
import cors from "cors";
import db from './db/conn.js';
import dotenv from 'dotenv';
import UserRouter from "./router/user.js";
import ProductRouter from "./router/product.js";
import CheckoutRouter from "./router/checkout.js";
import cookieParser from 'cookie-parser';
import CategoryRouter from "./router/category.js";
import SubCategoryRouter from "./router/subcategory.js";
import PayoutRouter from "./router/payout.js";
import cron from 'node-cron';
import Checkout from "./model/checkout.js";
import sendRenewalEmail from './controller/notification.js';
import { handleWebhook } from './controller/stripeController.js';
import subscriptionRoutes from "./router/subscription.js";
import https from 'https';
import http from 'http';

dotenv.config();

const app = express();
// Webhook route - Use raw body for this specific route
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Middleware
app.use(express.json()); // General JSON body parser
app.use(cors());
app.use(express.static('public'));
app.use(cookieParser());

// Routers
app.use('/auth', UserRouter);
app.use('/product', ProductRouter);
app.use('/checkout', CheckoutRouter);
app.use('/category', CategoryRouter);
app.use('/subcategory', SubCategoryRouter);
app.use('/payout', PayoutRouter);
app.use("/subscription", subscriptionRoutes);


app.get('/', (req, res) => {
    res.send("Hello Sonu, how are you?");
});

// app.listen(5000, () => {
//     console.log("Server Started");
//     db();
// });

// Scheduled job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running daily membership check...');

    // Get today's date and one month from now
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Start of today
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999); // End of today
    
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    const startOfOneMonthFromNow = new Date(oneMonthFromNow.getFullYear(), oneMonthFromNow.getMonth(), 1); // Start of one month from now
    const endOfOneMonthFromNow = new Date(oneMonthFromNow.getFullYear(), oneMonthFromNow.getMonth() + 1, 0, 23, 59, 59, 999); // End of one month from now

    // Log the dates for debugging
    console.log('Start of Today:', startOfToday);
    console.log('End of Today:', endOfToday);
    console.log('Start of One Month From Now:', startOfOneMonthFromNow);
    console.log('End of One Month From Now:', endOfOneMonthFromNow);

    // Find memberships with expiration dates between today and one month from now
    const memberships = await Checkout.find({
      expirationDate: {
        $gte: startOfToday,
        $lte: endOfOneMonthFromNow,
      },
    }).populate('userId'); // Populate user details if needed

    console.log('Found memberships:', memberships.length);

    // Process each membership
    for (const membership of memberships) {
      console.log('Processing membership:', membership);
      const { userId } = membership;
      await sendRenewalEmail(userId, membership);
    }

    console.log('Renewal reminder process completed.');
  } catch (error) {
    console.error('Error in daily membership check:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // Timezone for IST
});


const port = process.env.PORT;
let server;
if (process.env.SERVER_MODE === 'https' && process.env.NODE_ENV === 'production') {
    // production
    server = https.createServer({
        key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
        ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
    }, app);
} else {
    // development
    server = http.createServer(app);
}

server.listen(port, () => {
    console.log(`[Server]: Server is running at http://localhost:${port}`);
});