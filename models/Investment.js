import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// Transaction Schema (Sub-document)
const transactionSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    operation: {
      type: String,
      required: true,
      enum: ["buy", "sell", "dividend", "interest", "deposit", "withdrawal"],
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    shares: {
      type: Number,
      default: null,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// INVESTMENT SCHEMA
const investmentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Stock", "ETF", "Bond", "Real Estate", "Crypto", "Cash", "Other"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "sold", "pending"],
      default: "active",
    },
    annualInterestRate: {
      type: Number,
      default: 0,
    },
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
investmentSchema.plugin(toJSON);

export default mongoose.models.Investment || mongoose.model("Investment", investmentSchema); 