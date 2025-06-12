import mongoose from "mongoose";

const profileUpdateSchema = mongoose.Schema({
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProfileImage"
    },
    
    fname:{
        type: String,
        
    },
    lname:{
        type: String,
    },
},
{
    timestamps: true
});

const ProfileUpdate = mongoose.model("ProofileUpdate", profileUpdateSchema);

export default ProfileUpdate;