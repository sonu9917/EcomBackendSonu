import Stripe from 'stripe';
import dotenv from 'dotenv';
import Checkout from '../model/checkout.js';
import User from '../model/user.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Import for ES modules
import Transition from '../model/transition.js';
   
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { items, extend, currentExpiryDate,userId } = req.body;

  console.log(userId)

  console.log(items)

  try {
    // Create a customer with metadata
    const customer = await stripe.customers.create({
      metadata: {
        items: JSON.stringify(items),userId // Store items as a JSON string
      },
    });

    // Define the recurring price ID (replace with your actual price ID)
    const recurringPriceId = items.PriceId; // Replace with your actual price ID

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        {
          price: recurringPriceId, // Use the recurring price ID
          quantity: 1,
        },
      ],
      
      mode: 'subscription', // Set to 'subscription' for recurring payments
      success_url: `${process.env.CLIENT_URL}/checkout/success/{CHECKOUT_SESSION_ID}/key/${items.key}?extend=${encodeURIComponent(extend)}&expiry=${encodeURIComponent(currentExpiryDate)}`, // Redirect URL after successful payment
      cancel_url: `${process.env.CLIENT_URL}/failed-payment`, // Redirect URL after canceled payment
    });


    const transition = new Transition({
      userId,
      // sessionId:,
    });

    await transition.save();
    console.log('Transition record created successfully.');

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// get all checkout
export const getAllCheckout = async (req, res) => {
  try {
    let checkout = []

    checkout = await Checkout.find()

    // console.log(checkout)

    res.status(200).json({ success: "All checkout found", checkout })

  } catch (error) {
    console.error("get checkout details error:", error);
    res.status(500).send("An error occurred while get all checkout");
  }
}

export const getInvoice = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Fetch user and checkout data
    const user = await User.findOne({ _id: userId });
    const checkout = await Checkout.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!checkout) {
      return res.status(404).json({ error: 'Checkout data not found' });
    }

    // Define the path for the PDF
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const invoicePath = path.join(__dirname, '../public/invoices', `invoice_${userId}.pdf`);

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    // Use a writable stream for the PDF
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);

    // Add a logo (if you have one)
    // doc.image('path/to/logo.png', 50, 45, { width: 150 });

    // Add header
    doc.fontSize(30).font('Helvetica-Bold').fillColor('#4A90E2').text('Invoice', { align: 'center' });
    doc.moveDown(1);

    // Draw a line
    doc.moveTo(50, 100).lineTo(550, 100).stroke('#4A90E2');

    // Customer Details
    doc.moveDown();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#333333').text('Customer Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').fillColor('#555555')
      .text(`Name: ${user.firstName} ${user.lastName}`)
      .text(`Email: ${user.email}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown(1);

    // Add a table-like structure for invoice details
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#333333').text('Invoice Details', { underline: true });
    doc.moveDown(0.5);

    // Draw table headers
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#555555')
      .text('Membership Type', 50, 300, { width: 200, align: 'left' })
      .text('Purchase Date', 250, 300, { width: 150, align: 'center' })
      .text('Amount', 400, 300, { width: 100, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);

    // Add invoice items
    const { membershipType, membershipPrice, purchaseDate } = checkout;
    const items = [
      {
        description: membershipType,
        purchaseDate: new Date(purchaseDate).toLocaleDateString(),
        amount: `$${membershipPrice.toFixed(2)}`,
      },
    ];

    items.forEach((item) => {
      doc.fontSize(12).font('Helvetica').fillColor('#555555')
        .text(item.description, 50, 350, { width: 200, align: 'left' })
        .text(item.purchaseDate, 250,350, { width: 150, align: 'center' })
        .text(item.amount, 400,350, { width: 100, align: 'right' });
      doc.moveDown(0.5);
    });

    // Draw table footer
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#555555').text(`Total: $${membershipPrice.toFixed(2)}`, { align: 'right' });
    doc.moveDown(1);

    // Add a thank you note
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#4A90E2').text('Thank you for your purchase!', { align: 'center' });
    doc.moveDown(1);

  
    doc.end();

    // Wait for the stream to finish writing
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Send the invoice URL
    res.json({ invoiceUrl: `${process.env.BACKEND_URL}/invoices/invoice_${userId}.pdf` });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
