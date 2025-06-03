import express from "express";
import dotenv from "dotenv"
import bodyParser from "body-parser";
import connectDB from "../config/databaseConnect.js";
import userRouter from "../routes/userRouter.js";
import cookieParser from "cookie-parser";
import flankAIRouter from "../routes/flankAIRouter.js";

import friendsRouter from "../routes/friendsRouter.js";
import friendRequestRouter from "../routes/friendRequestRouter.js";


connectDB()
dotenv.config({
    path: "backend/config/config.env"
})

const app = express()

app.use(cookieParser())  //allow the app to use cookie parser for login timeouts and sessions
app.use(express.json())
app.use(bodyParser.json())



// Using routers
app.use("/api/v1/fort",userRouter)   //router must be same as that in the frontend's store,axios.post method
app.use("/api/v1/fort",friendsRouter)   //router must be same as that in the frontend's store,axios.post method
app.use("/api/v1/fort",friendRequestRouter)   //router must be same as that in the frontend's store,axios.post method

// ai router
app.use("api/v1/fort",flankAIRouter)

export default app