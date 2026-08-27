import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)   
        console.log(`MongoDB Connected successfully : ${conn.connection.host}`)
    }catch(error){
        console.error(`mongodb connection failed: ${error.message}`)
    process.exit(1)
    }   
}

export default connectDB;