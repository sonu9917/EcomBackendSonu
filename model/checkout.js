// import mongoose from "mongoose";

// const checkoutSchema = new mongoose.Schema({
//   session_id: { type: String, required: true },
//   amount: { type: Number, required: true },
//   currency: { type: String, required: true },
//   status: { type: String, required: true },
//   created_at: { type: Date, default: Date.now },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
// });

// const Checkout = mongoose.model("Checkout", checkoutSchema);

// export default Checkout;


import mongoose from 'mongoose';

const { Schema } = mongoose;

const checkoutSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['6-month', '12-month','none']
  },
  membershipPrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled'],
    default: 'active'
  },
  paymentStatus:{
    type:String,
    enum: ['pending', 'success'],
    default:'pending'
  },
  paymentIntentId: {
    type: String,
    // required: true
  },
  session_id: {
    type: String,
    // required: true
  },
  stripeCustomerId:{
    type:String,
    required:true
  }

});

const Checkout = mongoose.model('Checkout', checkoutSchema);
export default Checkout;
