import express from "express"
import authMiddleware from "../../utils/authMIddleware.js";
import { flankAiController } from "../../controller/flankAiController.js";

const flankAiRouter = express.Router();

flankAiRouter.post("/getting-flash-room-summary",authMiddleware,flankAiController);
 export default flankAiRouter; 