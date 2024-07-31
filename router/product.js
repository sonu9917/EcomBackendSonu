import {Router} from 'express'
import { addProduct, adminProductList, deleteExpiredAdminProduct, deleteProduct, getProductsByCategoryAndSubcategory, productInquiry, productList, updateProduct } from '../controller/product.js'
import upload from '../middleware/uploadMiddleware.js';
import adminAccessMiddleware from '../middleware/adminAccess.js';


const ProductRouter = Router();

ProductRouter.post('/addProduct',upload,adminAccessMiddleware,addProduct);
ProductRouter.get('/getAllProduct/:id?',productList);
ProductRouter.get('/getAdminProduct/:id?',adminAccessMiddleware,adminProductList)
ProductRouter.delete('/deleteProduct/:id',adminAccessMiddleware,deleteProduct);
ProductRouter.put('/updateProduct/:id', upload,adminAccessMiddleware,updateProduct);
ProductRouter.get('/getProductsByCategoryAndSubcategory',getProductsByCategoryAndSubcategory)
ProductRouter.post('/product-inquiry/:id',productInquiry)
ProductRouter.post('/delete-expired',deleteExpiredAdminProduct)

export default ProductRouter