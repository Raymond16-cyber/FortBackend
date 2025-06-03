import dotenv from "dotenv"
dotenv.config({ path: "./config.env" })

import http from "http"
import app from "./app/app.js"


const PORT = process.env.PORT || 4000;



const server =http.createServer(app)
console.log("PORT:", process.env.PORT);


// app.get("/",(req,res)=>{
//     res.send("hola")
// })


server.listen(PORT,()=>{
    console.log("🚀 Sever currently running on port 4000");
    
})


