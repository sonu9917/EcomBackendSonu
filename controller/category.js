import Category from "../model/category.js";


// add category logic
export const addCategory = async (req, res) => {
  try {
    // Destructure name and subCategory from request body
    const { name } = req.body;

    // Create a new category instance
    const category = new Category({
      name,
      userId: req.user._id, // Set userId from the authenticated user
    });

    // Save the category
    await category
      .save()
      .then(async () => {
        // Respond with a success message
        res.status(200).json({ success: "Category added successfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ error: "Invalid user data" });
      });
  } catch (error) {
    console.log("Error in addCategory controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// get category logic
export const getCategory = async (req, res) => {
  try {

    const { id } = req.params

    // console.log(id)

    let category = []

    if (id) {

       category = await Category.findOne({_id : id})

    } else {
      // Find All categories 
       category = await Category.find();
    }



    // console.log(category)



    // Check if categories were found
    if (category) {
      res.status(200).json({ success: "Categories found", category });
    } else {
      res.status(404).json({ message: "No categories found for this user" });
    }
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// delete category logic
export const deleteCategory = async (req, res) => {
  try {
    // Extract category ID from request parameters
    const { id } = req.params;

    // Extract user ID from request object
    // const userId = req.user._id;

    // Find and delete the category if it belongs to the user
    const category = await Category.findOneAndDelete({ _id: id });

    if (!category) {
      return res.status(404).json({ message: "Category not found or unauthorized" });
    }

    // Respond with success message
    res.status(200).json({ success: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// update category logic
export const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

   
    // Find the existing category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update fields
    if (name) category.name = name;

    await category.save();
    res.status(200).json({ success: "Category updated successfully" });
  } catch (error) {
    console.error("Error update category:", error.message);
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
  }
}