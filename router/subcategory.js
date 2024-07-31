import { Router } from "express";
import { addSubCategory, getSubCategory } from "../controller/subcategory.js";

const SubCategoryRouter = Router()


SubCategoryRouter.post('/addSubCategory',addSubCategory);
SubCategoryRouter.get('/getSubCategory',getSubCategory);

export default SubCategoryRouter