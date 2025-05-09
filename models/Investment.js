import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

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
    date: {
      type: Date,
      required: true,
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
    purchaseInformation: {
      type: {
        currency: {
          type: String,
          required: true,
          default: "USD"
        },
        purchasePrice: {
          type: Number,
          required: true
        }
      },
      required: true
    },
    currentValuation: {
      type: {
        currency: {
          type: String,
          required: true,
          default: "USD"
        },
        currentPrice: {
          type: Number,
          required: true
        }
      },
      required: true
    },
    notes: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
investmentSchema.plugin(toJSON);

export default mongoose.models.Investment || mongoose.model("Investment", investmentSchema); 