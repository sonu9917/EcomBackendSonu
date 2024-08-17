import mongoose from 'mongoose';

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  openTime: {
    type: String, // You can also use Date type if you prefer
    required: true,
  },
  closeTime: {
    type: String, // You can also use Date type if you prefer
    required: true,
  },
});

const storeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeName: {
    type: String,
    required: true,
  },
  storeCategory: {
    type: String,
    required: true,
  },
  address: {
    street: { type: String },
    street2: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
    state:{type: String}
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  schedule: {
    type: [dayScheduleSchema],
    default: [], // Default to an empty array
  },
  banner: {
    url: String,
    public_id: String,
  },
  profilePicture: {
    url: String,
    public_id: String,
  },
  biographyPicture: {
    url: String,
    public_id: String,
  },
  biographyText: {
    type: String,
  },
  socialProfiles: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    flicker:{type:String,default:''},
    threads:{type:String,default:''}
  },
  shipping: [{
    zoneName: { type: String, default: '' },
    region: { type: String, default: '' },
    shippingMethod: { type: String, default: '' },
    processingTime: { type: String, default: '' },
    shippingPolicy: { type: String, default: '' },
    refundPolicy: { type: String, default: '' },
  }]
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
