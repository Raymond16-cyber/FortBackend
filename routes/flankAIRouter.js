import express from "express";
import googleAIController from "../controller/googleAIController.js";


const flankAIRouter = express.Router()

flankAIRouter.post("/homePage/flank.ai",googleAIController)


export default flankAIRouter