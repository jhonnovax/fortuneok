import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// ASSET SCHEMA
const assetSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["real_estate", "certificates_of_deposit", "savings_account", "precious_metals", "cash", "p2p_loans", "stocks", "bonds", "cryptocurrencies", "etf_funds", "option", "futures", "other"],
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
    shares: {
      type: Number,
      default: null,
    },
    currentValuation: {
      type: {
        currency: {
          type: String,
          default: "USD"
        },
        amount: {
          type: Number,
        }
      },
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
assetSchema.plugin(toJSON);

export default mongoose.models.Asset || mongoose.model("Asset", assetSchema); 