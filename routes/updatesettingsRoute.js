import express from "express";
import authMiddleware from "../utils/authMIddleware.js";
import { changeProfileVisibilityController, getUserSettings } from "../controller/updateSettings.js";
const settingsRouter = express.Router()

settingsRouter.put("/update-profile-visibilty/:userId",authMiddleware,changeProfileVisibilityController)
settingsRouter.post("/get-user-settings",authMiddleware,getUserSettings)

export default settingsRouter