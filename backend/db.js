import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected.");
}

const chatSchema = new mongoose.Schema({
  userMessage: { type: String, required: true },
  botReply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new mongoose.Schema({
  contractText: { type: String, required: true },
  reviewResult: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Chat = mongoose.model("Chat", chatSchema);
export const Review = mongoose.model("Review", reviewSchema);
