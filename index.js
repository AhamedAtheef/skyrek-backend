import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import userRouter from "./Router/userRouter.js";
import jwt from "jsonwebtoken";
import productrouter from "./Router/productRouter.js";
import dotenv from "dotenv";
import cors from "cors";
import orderRouter from "./Router/orderRouter.js";
//load .env
dotenv.config()


const app = express()
app.use(bodyParser.json())
app.use(cors())//accept all req


app.use((req,res,next)=>{
      const tokenvalue=req.header("Authorization")
      if (tokenvalue != null){
        const tokenvalue2=tokenvalue.replace("Bearer ","")
        jwt.verify(tokenvalue2,process.env.Jwt_Key,(err,decoded)=>{
          if(decoded == null){
            res.status(403).json({message:"UnAuthorized"})
          }
          else{
              req.user= decoded
              console.log(decoded)
              next()
          }
        })
      }else{
        next()
      }
      
    
})

// connect mongodb
const connectionString = process.env.Mongo_Url
/* then=true , catch=false */
mongoose.connect(connectionString).then(() => {
    console.log("Connected to database")
}).catch(() => {
    console.log("Failed to connect to the database")
}) 


app.use("/api/products",productrouter)
app.use("/api/users", userRouter)
app.use("/api/orders", orderRouter)


app.listen(5000, () => {
    console.log("Server Started") 
})