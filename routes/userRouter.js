import express from "express";
import { userLoginController, userLogoutController, userRegisterController } from "../controller/userController.js";

const userRouter = express.Router()

// register router
userRouter.post("/user-register",userRegisterController)

//login router
userRouter.post("/user-login",userLoginController)

// logout router
userRouter.post("/user-logout",userLogoutController)




export default userRouter