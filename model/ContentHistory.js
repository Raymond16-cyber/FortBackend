import mongoose from "mongoose"

//Schema
const historySchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content:{
        type: String,
        required: true
    }
},
{
    timestamps:true
}
);

const ContentHistory = mongoose.model("ContentHistory", historySchema);  //Creating our collection name and defining our schema in our model

export default ContentHistory  //This line of code exports our schema