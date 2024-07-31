import { Router } from "express";
import { addCategory, getCategory } from "../controller/category.js";

const CategoryRouter = Router()


CategoryRouter.post('/addCategory',addCategory);
CategoryRouter.get('/getCategory',getCategory);

export default CategoryRouter