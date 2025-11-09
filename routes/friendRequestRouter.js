import express from "express";
import authMiddleware from "../utils/authMIddleware.js";
import { acceptFriendRequest, blockUserRequest, cancelFriendRequestController, getAllFriendRequests, sendFriendRequest } from "../controller/friendRequestController.js";

const friendRequestRouter = express.Router()

friendRequestRouter.get("/get-all-friend-requests",authMiddleware,getAllFriendRequests)
friendRequestRouter.post("/send-friend-request/:receiverID",authMiddleware,sendFriendRequest)
friendRequestRouter.delete("/cancel-friend-request/:requestId",authMiddleware,cancelFriendRequestController)
friendRequestRouter.post("/accept-friend-request",authMiddleware,acceptFriendRequest)
friendRequestRouter.post("/block-user",authMiddleware,blockUserRequest)


export default friendRequestRouter