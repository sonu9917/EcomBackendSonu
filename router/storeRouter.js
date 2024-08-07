import { Router } from "express";
import { addStore, getStoreDetails, updateStoreDetails } from "../controller/storeController.js";
import upload from "../middleware/uploadStoreImage.js";
import { adminAccessMiddleware } from '../middleware/adminAccess.js';

const StoreRouter = Router()


StoreRouter.post('/addStore',upload,adminAccessMiddleware,addStore);
StoreRouter.get('/getStore',adminAccessMiddleware,getStoreDetails);
StoreRouter.put('/updateStore',adminAccessMiddleware,updateStoreDetails);

export default StoreRouter