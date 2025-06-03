import mongoose from "mongoose"

const profileImageSchema = mongoose.Schema({
    user :{
        type: String,
        ref: "User",
    }
    
},
{
    timestamps: true
});

const Image = mongoose.model("ProfileImage", profileImageSchema);

export default Image;