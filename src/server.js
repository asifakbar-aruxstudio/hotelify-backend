import dotenv from "dotenv";
dotenv.config({path : "./.env"});
import dns from "dns";
dns.setServers(["8.8.8.8","1.1.1.1"]);


import { app } from "./app.js";
import connectDB from "./config/db.js";



const serverStart = async () => {
    try{
      await connectDB();
      app.listen(process.env.PORT || 8000 ,  ()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
      }) ;
    }catch(error){
console.error("Server Connection Field",error)
    }
} 
export default serverStart();