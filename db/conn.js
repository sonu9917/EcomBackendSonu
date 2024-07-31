import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const DB = process.env.DATABASE_URL;

const conn = () => {
  mongoose
    .connect(DB)
    .then(() => console.log("DataBase Connected", DB))
    .catch((errr) => {
      console.log(errr);
    });
};

export default conn;
