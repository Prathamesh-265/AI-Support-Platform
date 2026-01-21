import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
  },
  { timestamps: true }
);

documentSchema.index({ createdAt: -1 });

export const Document = mongoose.model("Document", documentSchema);
