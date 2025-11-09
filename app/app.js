import express from "express";

import cors from "cors";
import bodyParser from "body-parser";

import connectDB from "../config/databaseConnect.js";
import userRouter from "../routes/userRouter.js";
import emailRouter from "../routes/emailRouter.js";

import friendsRouter from "../routes/friendsRouter.js";
import friendRequestRouter from "../routes/friendRequestRouter.js";
import editProfileRouter from "../routes/editProfileRouter.js";
import FlashRoomRouter from "../routes/Rooms/FlashRoomRouter.js";
import flankAiRouter from "../routes/flankAi/flankAiRouter.js";
import archiveChatRouter from "../routes/archiveChatRoute.js";
import settingsRouter from "../routes/updatesettingsRoute.js";
import cookieParser from "cookie-parser"

// Connect to database
connectDB();

const app = express();

// CORS config
app.use(
  cors({
    // origin: "https://fort-hive-frontend.vercel.app", // Replace with frontend domain on production
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// Optional: health check
app.get("/", (req, res) => {
  res.send("✅ Backend server is running");
});

// Routers
app.use("/api/v1/fort", userRouter);
app.use("/api/v1/fort", settingsRouter);
app.use("/api/v1/fort", emailRouter);
app.use("/api/v1/fort", friendsRouter);
app.use("/api/v1/fort", archiveChatRouter);
app.use("/api/v1/fort", friendRequestRouter);
app.use("/api/v1/fort", editProfileRouter);
app.use("/api/v1/fort", FlashRoomRouter);
app.use("/api/v1/fort", flankAiRouter);

export default app;
