import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'

dotenv.config()


cloudinary.config({
    cloud_name:"djny2t0xz",
    api_key:"262497478179974",
    api_secret:process.env.CLOUDINARY_SECRET
})

export default cloudinary