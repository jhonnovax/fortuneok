import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// LOG SCHEMA - Stores front-end errors and user actions for debugging
const logSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      trim: true,
      required: true,
      enum: [
        "add",
        "delete",
        "update",
        "fetch",
        "error",
        "warning",
        "info",
        "api_error",
        "validation_error",
        "global_error",
        "unknown",
      ],
    },
    errorType: {
      type: String,
      enum: ["error", "warning", "info"],
      default: "error",
    },
    errorMessage: {
      type: String,
      required: true,
    },
    errorStack: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    statusCode: {
      type: Number,
    },
    requestUrl: {
      type: String,
    },
    requestMethod: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          // Allow null/undefined or valid HTTP methods
          if (value === null || value === undefined) return true;
          const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
          return validMethods.includes(value);
        },
        message: "{VALUE} is not a valid request method",
      },
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
    },
    responseData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add indexes for common queries
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ userEmail: 1, createdAt: -1 });
logSchema.index({ action: 1, createdAt: -1 });
logSchema.index({ errorType: 1, createdAt: -1 });
logSchema.index({ url: 1, createdAt: -1 });

// add plugin that converts mongoose to json
logSchema.plugin(toJSON);

export default mongoose.models.Log || mongoose.model("Log", logSchema);
