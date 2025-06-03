import express from "express";
import authMiddleware from "../utils/authMIddleware.js";
import { acceptFriendRequest, blockUserRequest, sendFriendRequest } from "../controller/friendRequestController.js";

const friendRequestRouter = express.Router()

friendRequestRouter.post("/send-friend-request",authMiddleware,sendFriendRequest)
friendRequestRouter.post("/accept-friend-request",authMiddleware,acceptFriendRequest)
friendRequestRouter.post("/block-user",authMiddleware,blockUserRequest)


export default friendRequestRouter