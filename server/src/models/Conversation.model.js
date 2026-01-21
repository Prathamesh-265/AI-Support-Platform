import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ unique already creates index
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
      // ✅ removed `index: true` (we keep schema index below)
    },
  },
  { timestamps: true }
);

// ✅ removed duplicate index for userId
// conversationSchema.index({ userId: 1 });

// ✅ keep this for sorting chats quickly
conversationSchema.index({ lastUpdated: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
