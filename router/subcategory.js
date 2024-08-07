import { Router } from "express";
import { addSubCategory, deleteSubCategory, getSubCategory, updateSubCategory } from "../controller/subcategory.js";

const SubCategoryRouter = Router()


SubCategoryRouter.post('/addSubCategory',addSubCategory);
SubCategoryRouter.get('/getSubCategory/:id?',getSubCategory);
SubCategoryRouter.delete('/deleteSubCategory/:id',deleteSubCategory)
SubCategoryRouter.put('/updateSubCategory/:id',updateSubCategory)

export default SubCategoryRouter