import express from "express";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import connectDB from "../config/databaseConnect.js";
import userRouter from "../routes/userRouter.js";
import flankAIRouter from "../routes/flankAIRouter.js";
import friendsRouter from "../routes/friendsRouter.js";
import friendRequestRouter from "../routes/friendRequestRouter.js";

// Connect to database
connectDB();

const app = express();

// CORS config
app.use(
  cors({
    origin: "https://fort-hive-frontend.vercel.app", // Replace with frontend domain on production
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
app.use("/api/v1/fort", friendsRouter);
app.use("/api/v1/fort", friendRequestRouter);
app.use("/api/v1/fort", flankAIRouter); // ✅ fixed missing slash

export default app;
