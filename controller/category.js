import Category from "../model/category.js";
import Subcategory from "../model/subCategory.js";

export const addCategory = async (req, res) => {
  try {
    const { name , subCategory} = req.body;
    const category = new Category({
      name,
    });

    await category
      .save()
      .then( async () => {

        const newCategory = new Subcategory({
          name:subCategory,
          mainCategory:category._id
        })

        await newCategory.save()

        res.status(200).json({ success: "Category added successfully" });
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

export const getCategory = async (req, res) => {
  let category = [];

  if (category) {
    category = await Category.find();
  }

  if (category) {
    res.status(200).json({ success: "All category found", category });
  }
};
