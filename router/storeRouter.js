import { Router } from "express";
import { addStore, getStoreDetails, updateSocialLinks, updateStoreDetails } from "../controller/storeController.js";
import upload from "../middleware/uploadStoreImage.js";
import protectRoute  from '../middleware/protectRoute.js';

const StoreRouter = Router()


StoreRouter.post('/addStore',upload,protectRoute,addStore);
StoreRouter.get('/getStore',protectRoute,getStoreDetails);
StoreRouter.post('/updateStore',upload,protectRoute,updateStoreDetails);
StoreRouter.put('/updateSocialLinks',protectRoute,updateSocialLinks)

export default StoreRouter