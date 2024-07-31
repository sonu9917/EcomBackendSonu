import Stripe from 'stripe';
import dotenv from 'dotenv';
import Checkout from '../model/checkout.js';
import sendEmail from '../utils/sendEmail.js';
import updateUserRoleToAdmin from '../utils/updateUserToAdmin.js'

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.ENDPOINT_SECRET;

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('Stripe-Signature header is missing');
    return res.status(400).send('Stripe-Signature header is missing');
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice);
        await handleSubscriptionPaymentSucceeded(invoice);
        break;
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription);
        await handleSubscriptionCancelled(subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

const handleSubscriptionPaymentSucceeded = async (invoice) => {
  try {
    const customerId = invoice.customer;
    const sessionId = invoice.session_id;
    const paymentIntentId = invoice.payment_intent;

    // Retrieve customer information from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    const items = JSON.parse(customer.metadata.items); // Assuming metadata contains membership details

    console.log(sessionId, customer);

    // Retrieve the existing checkout record for the user
    let checkout = await Checkout.findOne({ userId: customer.metadata.userId });

    if (checkout) {
      // Calculate remaining time if the user is upgrading or extending
      const currentExpirationDate = new Date(checkout.expirationDate);
      const now = new Date();
      let newExpirationDate;

      if (items.key === '12-month') {
        // For upgrading to 12-month membership
        if (currentExpirationDate > now) {
          // Add the remaining days to the new expiration date
          newExpirationDate = new Date(currentExpirationDate);
        } else {
          // Membership expired, set to new 12 months from now
          newExpirationDate = new Date(now);
        }
        newExpirationDate.setMonth(newExpirationDate.getMonth() + 12);
      } else if (items.key === '6-month') {
        // For extending the 6-month membership
        if (currentExpirationDate > now) {
          // Add the remaining days to the new expiration date
          newExpirationDate = new Date(currentExpirationDate);
        } else {
          // Membership expired, set to new 6 months from now
          newExpirationDate = new Date(now);
        }
        newExpirationDate.setMonth(newExpirationDate.getMonth() + 6);
      }

      checkout.membershipPrice = items.price / 100; // Update price
      checkout.membershipType = items.key;
      checkout.expirationDate = newExpirationDate;
      checkout.paymentIntentId = paymentIntentId;
      checkout.paymentStatus = 'success';
      checkout.purchaseDate = Date.now();
      checkout.status = 'active'; // Ensure status is active

      // Save the updated checkout record
      await checkout.save();

    } else {
      // No existing checkout, create a new one
      const expirationDate = new Date(new Date().setMonth(new Date().getMonth() + (items.key === '12-month' ? 12 : 6)));

      checkout = new Checkout({
        membershipPrice: items.price / 100,
        membershipType: items.key,
        expirationDate: expirationDate,
        paymentIntentId: paymentIntentId,
        currency: 'INR',
        paymentStatus: 'success',
        purchaseDate: Date.now(),
        status: 'active',
        userId: customer.metadata.userId,
        stripeCustomerId: customerId,
      });

      // Save the new checkout record
      await checkout.save();
    }

    // Update user role and subscription
    await updateUserRoleToAdmin(checkout.userId, items.key);

    // Send a confirmation email to the user
    await sendEmail(
      customer.email,
      'Payment Successful',
      `<h1>Payment Successful</h1>
        <p>Thank you for your purchase! Your payment of ${checkout.membershipPrice} INR was successful.</p>
        <p>Your membership type is: ${checkout.membershipType}</p>
        <p>Your membership will be valid until ${checkout.expirationDate.toDateString()}.</p>
        <p>If you have any questions, feel free to contact us.</p>`
    );

    console.log('Payment success handling complete');
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
  }
};





const handleSubscriptionCancelled = async (subscription) => {
  try {
    const customerId = subscription.customer;
    const checkout = await Checkout.findOne({ stripeCustomerId: customerId }).populate('userId');

    if (!checkout) {
      console.error('Checkout session not found in database');
      return;
    }

    // Update user subscription details
    const user = await User.findById(checkout.userId._id);
    user.subscription = null; // Clear subscription details
    await user.save();

    // Update checkout status
    checkout.status = 'canceled';
    await checkout.save();

    // Send a cancellation email to the user
    await sendEmail(
      user.email,
      'Membership Cancelled',
      `<h1>Membership Cancelled</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We're sorry to see you go! Your membership for ${checkout.membershipType} has been successfully cancelled.</p>
        <p>If you have any questions or need further assistance, please feel free to contact us.</p>
        <p>Thank you for being with us.</p>`
    );

    console.log('Subscription cancellation handling complete');
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
  }
};
