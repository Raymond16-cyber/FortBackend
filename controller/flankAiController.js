import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({
  path: "./config.env",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const flankAiController = asyncHandler(async (req, res) => {
  const { activityData } = req.body;
  console.log("Received activity data:", activityData);

  const prompt = `
You are a smart assistant analyzing chat room activity.

From the following chat data, generate a structured summary of key metrics. 
Output the result as a simple JSON object with the following fields:

- totalMessages: Number of messages in the room
- topSender: The user who sent the most messages
- jokerOfTheRoom: The user with the funniest or most lighthearted messages (if available)
- averageResponseTimeInSeconds: Estimated average response time between messages
- activeUsers: Number of distinct users who participated
- messagesPerUser: A map of userName to messageCount
- top3ActiveUsers: Array of top 3 users with most messages

Use this chat data:
${JSON.stringify(activityData, null, 2)}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // Clean up ```json ... ``` wrapping to remove the markdown(avoiding the object to be stringed)
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    }

    const data = JSON.parse(text);

    console.log("Gemini response parsed:", {
      roomID: activityData.roomID,
      summary: data,
    });

    res.status(200).json({
      summary: {
        roomID: activityData.roomID,
        text: data,
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});
