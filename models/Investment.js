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