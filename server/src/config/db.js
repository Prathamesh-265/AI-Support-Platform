import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
