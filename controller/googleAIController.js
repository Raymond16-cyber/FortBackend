//INtegrating   our   API
import asyncHandler from 'express-async-handler';
import axios from "axios";
import User from '../model/userModel.js';
import ContentHistory from '../model/ContentHistory.js';




// Google AI Controller
const googleAIController = asyncHandler(async(req,res)=>{
    const { prompt } = req.body
    console.log(prompt);

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                "contents": [
                    {
                        "parts":[
                            {
                                text: `${prompt}.Do not include any links in your responses.` //We're telling gemini not to consider link as a response
                            }
                        ],
                    },
                ],
                generationConfig:{
                    temperature: 2.0,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 20000,
                    stopSequences: []
                },

                safetySettings: [],
            },
            {
                headers:{
                    "Content-Type": "application/json",
                },
            }
            
        );


        const content = response?.data?.candidates[0]?.content?.parts[0].text?.trim()

        // create the history
        const newContent = await ContentHistory.create({
            user: req?.user?._id,
            content
        })

        //Push contents into the user
        const userFound = await User.findById(req?.user?._id)
        userFound.contentHistory.push(newContent?._id)

        //Update api request count
        userFound.apiRequestCount += 1
        //to save
        await userFound.save()
        res.status(200).json(content)
    } catch (error) {
        throw new error(error)
    }
})


export default googleAIController