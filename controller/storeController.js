// /controllers/storeController.js

import Store from '../model/storeModel.js';
import User from '../model/user.js';
// import { cloudinary } from '../utils/cloudinary.js';

// Add a new store
export const addStore = async (req, res) => {
  try {
    const { storeName, storeCategory, street, street2, city, zipCode, country, phone, email, schedule } = req.body;

    // console.log(req.files['banner'][0]);

    const bannerImage = req.files['banner'][0];
    const profileImage = req.files['profilePicture'][0];

    const newStore = new Store({
      userId:req.user._id,
      storeName,
      storeCategory,
      address: { street, street2, city, zipCode, country },
      phone,
      email,
      schedule,
      banner: {
        url: bannerImage.path,
        public_id: bannerImage.filename,
      },
      profilePicture: {
        url: profileImage.path,
        public_id: profileImage.filename,
      },
    });

    const savedStore = await newStore.save();

    res.status(201).json({
      message: 'Store added successfully',
      store: savedStore,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get store details
export const getStoreDetails = async (req, res) => {
  try {
    const store = await Store.findOne({userId:req.user._id});

    console.log(store)

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStoreDetails = async (req, res) => {
  const { socialProfiles, shipping } = req.body;
  const userId = req.user._id;

  // Validate request
  if (!userId) {
    return res.status(400).json({ error: 'User ID and social profiles are required' });
  }

  try {
    // Find the store associated with the user
    const store = await Store.findOne({ userId });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Merge existing social profiles with the new ones
    if (socialProfiles) {
      const updatedSocialProfiles = { ...store.socialProfiles, ...socialProfiles };
      store.socialProfiles = updatedSocialProfiles;
    }

    // Add new shipping information to the existing shipping list
    if (shipping) {
      if (!Array.isArray(store.shipping)) {
        store.shipping = [];
      }
      // Append the new shipping information
      store.shipping.push(shipping);
    }

    // Save the updated store details
    await store.save();

    // Send the updated store details as the response
    res.status(200).json({ message: "Store is updated" });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


