import express from "express";
import authMiddleware from "../utils/authMIddleware.js";
import { editProfileController,editProfilePicController } from "../controller/editProfileController.js";

const editProfileRouter = express.Router();

editProfileRouter.post("/edit-profile-details", authMiddleware,editProfileController);
editProfileRouter.post("/edit-profile-pic", authMiddleware,editProfilePicController);


export default editProfileRouter