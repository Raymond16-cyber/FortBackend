import express from "express";
import {
  userLoginController,
  userLogoutController,
  userRegisterController,
} from "../controller/userController.js";
import {
  blockFriendController,
  getAllUsersController,
  getFriendsController,
  unblockFriendController,
} from "../controller/friendsController.js";
import { AddFriendController } from "../controller/AddFriendCntroller.js";
import authMiddleware from "../utils/authMIddleware.js";
import {
  getMessageController,
  sendMessageController,
  sendImageController,
  seenMessageController,
  deliverMessageController,
} from "../controller/messageController.js";

const friendsRouter = express.Router();

// get friends
friendsRouter.get("/get-friends", authMiddleware, getFriendsController);
friendsRouter.post("/add-friends", authMiddleware, AddFriendController);
friendsRouter.post("/send-message", authMiddleware, sendMessageController);
friendsRouter.post("/send-image", authMiddleware, sendImageController);
friendsRouter.get(
  "/get-message/:friendid",
  authMiddleware,
  getMessageController
);
// block users
friendsRouter.post("/block-friend/:friendId",authMiddleware,blockFriendController)
friendsRouter.post("/unblock-friend/:friendId",authMiddleware,unblockFriendController)
// seen message
friendsRouter.post("/seen-message", authMiddleware, seenMessageController);
friendsRouter.post(
  "/delivered-message",
  authMiddleware,
  deliverMessageController
);

// get all users of fort
friendsRouter.get("/get-all-users", authMiddleware, getAllUsersController);

export default friendsRouter;
