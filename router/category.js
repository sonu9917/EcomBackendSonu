import { Router } from "express";
import { addCategory, deleteCategory, getCategory, updateCategory } from "../controller/category.js";
import {adminAccessMiddleware} from "../middleware/adminAccess.js";

const CategoryRouter = Router()


CategoryRouter.post('/addCategory',adminAccessMiddleware,addCategory);
CategoryRouter.get('/getCategory/:id?',getCategory);
CategoryRouter.delete('/deleteCategory/:id',adminAccessMiddleware,deleteCategory)
CategoryRouter.put('/updateCategory/:id',adminAccessMiddleware,updateCategory)

export default CategoryRouter