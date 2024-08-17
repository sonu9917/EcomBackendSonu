// /controllers/storeController.js

import Store from '../model/storeModel.js';

// Add a new store
export const addStore = async (req, res) => {
  try {
    const {
      storeName,
      storeCategory,
      street,
      street2,
      city,
      postelCode,
      country,
      state,
      phone,
      email,
      schedule,
      biographyText
    } = req.body;

    const bannerImage = req.files['banner'][0];
    const profileImage = req.files['profilePicture'][0];
    const biographyPicture = req.files['biographyPicture'] ? req.files['biographyPicture'][0] : null;

    // Convert the schedule array from req.body into the required format
    const formattedSchedule = JSON.parse(schedule).map(item => ({
      day: item.day,
      openTime: item.openTime,
      closeTime: item.closeTime,
    }));

    const newStore = new Store({
      userId: req.user._id,
      storeName,
      storeCategory,
      address: { street, street2, city, postelCode, country, state },
      phone,
      email,
      schedule: formattedSchedule, // Add the formatted schedule here
      banner: {
        url: bannerImage.path,
        public_id: bannerImage.filename,
      },
      profilePicture: {
        url: profileImage.path,
        public_id: profileImage.filename,
      },
      biographyPicture: biographyPicture ? {
        url: biographyPicture.path,
        public_id: biographyPicture.filename,
      } : null,
      biographyText,
    });

    const savedStore = await newStore.save();

    res.status(201).json({
      message: 'Store added successfully',
      store: savedStore,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};



// Get store details
export const getStoreDetails = async (req, res) => {
  try {
    const store = await Store.findOne({ userId: req.user._id });

    console.log(store)

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// update store details
export const updateStoreDetails = async (req, res) => {
  const {
    shipping,
    storeName,
    storeCategory,
    street,
    street2,
    city,
    postalCode,
    country,
    state,
    phone,
    email,
    schedule,
    biographyText
  } = req.body;

  // console.log(postalCode)

  const bannerImage = req.files['banner'] ? req.files['banner'][0] : null;
  const profileImage = req.files['profilePicture'] ? req.files['profilePicture'][0] : null;
  const biographyPicture = req.files['biographyPicture'] ? req.files['biographyPicture'][0] : null;

  const userId = req.user._id;


  // Convert the schedule array from req.body into the required format
  const formattedSchedule = JSON.parse(schedule).map(item => ({
    day: item.day,
    openTime: item.openTime,
    closeTime: item.closeTime,
  }));

  // Validate request
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Find the store associated with the user
    const store = await Store.findOne({ userId });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }


    if (shipping) {
      if (!Array.isArray(store.shipping)) {
        store.shipping = [];
      }
      store.shipping.push(...[].concat(shipping)); // Ensures shipping is always an array
    }

    if (storeName) {
      store.storeName = storeName;
    }

    if (storeCategory) {
      store.storeCategory = storeCategory;
    }

    if (street || street2 || city || postalCode || country || state) {
      store.address = {
        street,
        street2,
        city,
        postalCode,
        country,
        state
      };
    }

    if (phone) {
      store.phone = phone;
    }

    if (email) {
      store.email = email;
    }

    if (schedule) {
      store.schedule = formattedSchedule;
    }

    if (biographyText) {
      store.biographyText = biographyText;
    }

    // Handle file uploads
    if (bannerImage) {
      store.bannerImage = {
        url: bannerImage.path,
        public_id: bannerImage.filename,
      };
    }

    if (profileImage) {
      store.profileImage = {
        url: profileImage.path,
        public_id: profileImage.filename,
      };
    }

    if (biographyPicture) {
      store.biographyPicture = biographyPicture ? {
        url: biographyPicture.path,
        public_id: biographyPicture.filename,
      } : null;
    }

    // Save the updated store details
    await store.save();

    // Send the updated store details as the response
    res.status(200).json({ message: "Store updated successfully", store });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// update social Links
export const updateSocialLinks = async (req, res) => {
  const { socialProfiles } = req.body
  const userId = req.user._id;

  // Validate request
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {

     // Find the store associated with the user
     const store = await Store.findOne({ userId });

     if (!store) {
       return res.status(404).json({ error: 'Store not found' });
     }


    // Update store fields if provided
    if (socialProfiles) {
      store.socialProfiles = {
        ...store.socialProfiles,
        ...socialProfiles
      };
    }

    await store.save();

    res.status(200).send({success:"Social Links Updated",socialProfiles})

  } catch (error) {
    console.log("Error in UpdateSocialLinks Controller", error);
    res.status(500).send({ error: "Internal server error" })
  }
}


