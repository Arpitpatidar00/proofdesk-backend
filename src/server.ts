import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/index.js";
import type { Server } from "http";

let server: Server;

async function start() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    server = app.listen(config.port, () => {
      console.log(`API server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  const closeDbAndExit = async () => {
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
      process.exit(0);
    } catch (err) {
      console.error("Error during MongoDB disconnection:", err);
      process.exit(1);
    }
  };

  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      closeDbAndExit();
    });
  } else {
    closeDbAndExit();
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception! Shutting down...", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection! Shutting down...", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

start();
