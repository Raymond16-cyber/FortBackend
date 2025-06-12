import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fname:{
        type: String,
        required:true
    },
    lname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    pword:{
        type: String,
        required: true,
        select: false
    },
    confirmPword:{
        type: String,
        required: true
    },
    rememberMe:{
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: ""
    },
    bio:{
        type: String,
        default: "Lets Chat on fort....😁"
    },
    status:{
        type: String,
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
    
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;