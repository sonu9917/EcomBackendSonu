// models/categoryModel.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensures each category name is unique
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

});

const Category = mongoose.model('Category', categorySchema);

export default Category;
