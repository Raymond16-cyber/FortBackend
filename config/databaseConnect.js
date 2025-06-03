import mongoose from "mongoose";

const connString = process.env.MONGO_URL || "mongodb+srv://Raymond17:wsqbGhGGytmxVInn@clustergomycode.7pynx6y.mongodb.net/forthiveusers";


const connectDB = async () => {
  try {
    await mongoose.connect(connString);
    console.log("MongoDB setup was successful 🧘‍♀️");
  } catch (error) {
    console.error("An error occurred while connecting to MongoDB:", error);
  }
};

export default connectDB;
     