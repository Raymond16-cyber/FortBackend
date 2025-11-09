import express from "express";
import { addMemberToFlashRoom, checkDestroyedFlashRoom, deleteFlashRoomController, deleteMemberFromFlashRoom, FlashRoomController, getFlashRoomByIdController, getFlashRoomsController, getFlashRoomsMessagesController, sendFlashRoomMessageController } from "../../controller/Rooms/FlashRoomController.js";
import authMiddleware from "../../utils/authMIddleware.js";

const FlashRoomRouter = express.Router();

FlashRoomRouter.post("/create-flash-room",authMiddleware,  FlashRoomController);
FlashRoomRouter.get("/get-flash-room",authMiddleware,getFlashRoomsController);
FlashRoomRouter.post("/send-flash-room-messages",authMiddleware,sendFlashRoomMessageController);
FlashRoomRouter.get("/get-flash-room-messages",authMiddleware,getFlashRoomsMessagesController);
FlashRoomRouter.get("/join-flash-room-by-id",authMiddleware,getFlashRoomByIdController);
FlashRoomRouter.get("/check-destroyed-flash-room",authMiddleware,checkDestroyedFlashRoom);
FlashRoomRouter.delete("/delete-flash-room/:roomID",authMiddleware,deleteFlashRoomController);
FlashRoomRouter.post("/add-member-to-flash-room",authMiddleware,addMemberToFlashRoom);
FlashRoomRouter.delete("/delete-member-from-flash-room/:memberId",authMiddleware,deleteMemberFromFlashRoom);

export default FlashRoomRouter;
