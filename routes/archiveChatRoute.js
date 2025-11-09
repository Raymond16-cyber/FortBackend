import express from "express";
import authMiddleware from "../utils/authMIddleware.js";
import { getArchivesController,archiveChatController } from "../controller/archiveChatsController.js";

const archiveChatRouter = express.Router()

archiveChatRouter.get("/getArchives",authMiddleware,getArchivesController)
archiveChatRouter.post(`/archiveChat/:friendId`,authMiddleware,archiveChatController)

export default archiveChatRouter