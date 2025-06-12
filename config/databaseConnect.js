import mongoose from "mongoose";

// For mongo atlas
const connString =
  process.env.MONGO_URL ||
  "mongodb+srv://Raymond17:wsqbGhGGytmxVInn@clustergomycode.7pynx6y.mongodb.net/forthiveusers";

// locally
// const connString = process.env.MONGO_URL || "mongodb://localhost:27017/fortHiveUsers";

const connectDB = async () => {
  try {
    await mongoose.connect(connString);
    console.log("MongoDB setup was successful 🧘‍♀️");
  } catch (error) {
    console.error("An error occurred while connecting to MongoDB:", error);
  }
};

export default connectDB;
