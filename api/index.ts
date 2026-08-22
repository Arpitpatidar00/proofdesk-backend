import mongoose from "mongoose";
import app from "../src/app.js";
import { config } from "../src/config/index.js";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  
  try {
    await mongoose.connect(config.mongodbUri);
    isConnected = true;
    console.log("MongoDB connected (Serverless)");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default async function handler(req: any, res: any) {
  // Ensure DB is connected before handling the request
  await connectDB();
  
  // Delegate to Express app
  return app(req, res);
}
