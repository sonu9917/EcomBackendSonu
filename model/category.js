// models/categoryModel.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensures each category name is unique
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
