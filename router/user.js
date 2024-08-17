import {Router} from 'express'
import { forgotPassword, getUserDetails, login, logout, register, resetPassword, updateRoleSubscription, updateUserDetails, verifyOtp } from '../controller/user.js'
import protectRoute from '../middleware/protectRoute.js'


const UserRouter = Router()

UserRouter.post('/register',register)
UserRouter.post('/login',login)
UserRouter.post('/logout',logout)
UserRouter.get('/getUserDetails',protectRoute,getUserDetails)
UserRouter.post('/forgot-password',forgotPassword)
UserRouter.post('/verify-otp',verifyOtp)
UserRouter.post('/reset-password',resetPassword)
UserRouter.post('/update-role-subscription',updateRoleSubscription)
UserRouter.put('/updateUserDetails/:id',updateUserDetails)


export default UserRouter