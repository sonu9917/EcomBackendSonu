import mongoose from "mongoose";
import Product from "../model/product.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import User from "../model/user.js";
import sendEmail from "../utils/sendEmail.js";


// add product logic
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory } = req.body;
    const images = req.files; // This should be an array of files

    if (!images || images.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Upload each image to Cloudinary
    const imageUploads = images.map((file) => {
      return cloudinary.uploader.upload(file.path);
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(imageUploads);

    // Extract URLs or public IDs from the upload results
    const imageUrls = uploadResults.map((result) => result.secure_url); // Use secure_url for URLs

    // Create a new Product with image URLs
    const product = new Product({
      name,
      description,
      price,
      images: imageUrls, // Save image URLs
      user: req.user._id,
      category,
      subCategory,
    });

    await product.save();
    res.status(200).json({ success: "Product added successfully" });
  } catch (error) {
    console.log("Error in addProduct controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// product listing logic
export const productList = async (req, res) => {
  try {
    let product = [];

    const id = req.params.id;

    // console.log(id)

    if (id) {
      product = await Product.findOne({ _id: id }).populate('category').populate('subCategory').populate('user');
    } else {
      product = await Product.find().populate('category').populate('subCategory');
    }

    if (product) {
      res.status(200).json({
        success: "All product found",
        product,
        imageBaseUrl: "/uploads/",
      });
    }
  } catch (error) {
    console.log("Error in productList controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// delete product logic
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    await Product.deleteOne({ _id: id });
    res.status(200).json({ success: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// update product logic
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, category, subCategory } = req.body;
    const newImages = req.files?.images; // Array of new image files
    const existingImages = req.body.existingImages || []; // Array of existing image names/URLs

    // Find the existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;

    // Handle new image uploads
    if (newImages && newImages.length > 0) {
      // Upload new images to Cloudinary
      const uploadPromises = newImages.map(file =>
        cloudinary.v2.uploader.upload(file.path)
      );

      const uploadResults = await Promise.all(uploadPromises);

      // Delete old images from the filesystem
      // if (product.images && product.images.length > 0) {
      //   product.images.forEach(async image => {
      //     const publicId = path.basename(image, path.extname(image));
      //     await cloudinary.v2.uploader.destroy(publicId);
      //   });
      // }

      // Save new images URLs from Cloudinary
      const newImageUrls = uploadResults.map(result => result.secure_url);
      product.images = [...newImageUrls, ...existingImages];
    } else {
      product.images = existingImages;
    }

    // Save the updated product
    await product.save();
    res.status(200).json({ success: "Product updated successfully" });
  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// show only perticular admin products
export const adminProductList = async (req, res) => {
  try {
    // console.log(req.user)
    const _id = req.user._id.toString();

    // console.log(req.user._id.toString())

    let adminProduct = [];

    if (req.user) {
      adminProduct = await Product.find({ user: _id });
    }

    if (adminProduct) {
      res.status(200).json({
        success: "All product found",
        adminProduct,
        imageBaseUrl: "/uploads/",
      });
    }
  } catch (error) {
    console.log("Error in adminProductList controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// show product only filter by query
export const getProductsByCategoryAndSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId, searchQuery, page, limit } = req.query;
    const filter = {};

    console.log(req.query)

    // Convert categoryId and subcategoryId to ObjectId if present
    if (categoryId) {
      filter.category = new mongoose.Types.ObjectId(categoryId);
    }
    if (subcategoryId) {
      filter.subCategory = new mongoose.Types.ObjectId(subcategoryId);
    }
    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search
    }

    // Parse page and limit as integers
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 12;

    console.log(filter)

    const totalProducts = await Product.countDocuments(filter);
    const product = await Product.find(filter).skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber).populate('subCategory').populate('category');


    if (product) {
      res.status(200).json({
        success: "All products found",
        product,
        totalProducts,
        imageBaseUrl: "/uploads/", // Adjust as per your setup
      });
    } else {
      res.status(404).json({
        error: "No products found",
      });
    }
  } catch (error) {
    console.error('Error fetching products by category and subcategory:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// send email about product enquiry to perticular sellor add product

export const productInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const { id } = req.params;

    console.log(name, email, message, id);

    // Convert userId to ObjectId
    const productId = new mongoose.Types.ObjectId(id);

    // Find the admin (seller) to whom the inquiry should be sent
    const product = await Product.findOne({ _id: productId }).populate('user');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userId = product.user._id;
    const sellorEmail = product.user.email;

    console.log('Seller ID:', userId);
    console.log('Seller Email:', sellorEmail);

    if (!userId) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Include product details in the email
    const productName = product.name;
    const productPrice = product.price;
    const productDescription = product.description || 'No description available';

    await sendEmail(
      sellorEmail,
      'Product Inquiry',
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
          }
          .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Product Inquiry</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr />
          <h2>Product Details</h2>
          <p><strong>Product Name:</strong> ${productName}</p>
          <p><strong>Product Price:</strong> $${productPrice}</p>
          <p><strong>Product Description:</strong></p>
          <p>${productDescription}</p>
          <div class="footer">
            <p>Thank you for your inquiry. We will get back to you as soon as possible.</p>
            <p>Best regards,<br>Your Company Name</p>
          </div>
        </div>
      </body>
      </html>
    `
    );

    res.status(200).json({ message: 'Inquiry sent successfully' });
  } catch (error) {
    console.error('Error in productInquiry controller', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// delete expired admin product
export const deleteExpiredAdminProduct = async (req, res) => {
  try {
    const { userId } = req.body; // Extract the userId from the request body

    // Find expired products by userId
    const expiredProducts = await Product.find({ 
      user: userId, 
    });

    if (expiredProducts.length === 0) {
      return res.status(404).json({ message: "No expired products found for this user" });
    }

    // Delete expired products
    const deleteResult = await Product.deleteMany({ 
      user: userId,
    });

    res.status(200).json({
      message: `${deleteResult.deletedCount} expired product(s) deleted successfully`
    });

  } catch (error) {
    console.log("Error in deleting expired products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}