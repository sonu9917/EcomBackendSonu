import Subcategory from "../model/subCategory.js";

export const addSubCategory = async (req, res) => {
  try {
    console.log(req.body)

    const { category, subCategory } = req.body;
    const newSubCategory = new Subcategory({
      category,
      subCategory,
    });

    await newSubCategory
      .save()
      .then(() => {
        res.status(200).json({ success: "Sub Category added successfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ error: "Invalid user data" });
      });
  } catch (error) {
    console.log("Error in adminProductList controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSubCategory = async (req, res) => {
  let subCategory = [];

  if (subCategory) {
    subCategory = await Subcategory.find().populate('category');
  }

  if (subCategory) {
    res.status(200).json({ success: "All category found", subCategory });
  }
};
