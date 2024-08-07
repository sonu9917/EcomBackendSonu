import Subcategory from "../model/subCategory.js";


// add subcategory logic
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


// get subcategory logic
export const getSubCategory = async (req, res) => {
  let subCategory = [];
  const { id } = req.params

  if (subCategory) {
    if (id) {
      subCategory = await Subcategory.findOne({ _id: id }).populate('category')
    } else {
      subCategory = await Subcategory.find().populate('category');
    }
  }

  if (subCategory) {
    res.status(200).json({ success: "All category found", subCategory });
  }
};

// delete subcategory logic
export const deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the subcategory
    const subCategory = await Subcategory.findByIdAndDelete(id);

    // Check if the subcategory was found
    if (!subCategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    // Return a success message if deleted
    res.status(200).json({ success: "Subcategory deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error in delete subcategory controller" });
  }
};


// update category logic
export const updateSubCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { category,subCategory:subCategoryName } = req.body;

    console.log(req.body)

    // Find the existing category
    const subCategory = await Subcategory.findById(id);

    // console.log(subCategory)

    if (!subCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update fields
    if (category) subCategory.category = category;
    if(subCategoryName) subCategory.subCategory = subCategoryName;

    await subCategory.save();
    res.status(200).json({ success: "SubCategory updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in update subcategory controller" })
  }
}
