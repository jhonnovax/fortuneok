import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Asset from "@/models/Asset";
import { authOptions } from "@/libs/next-auth";
import { validateAssetData, parseCurrentValuationOfAsset } from "@/services/assetService";
import { getStockPrices } from "@/services/symbolService";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET - Retrieve a specific asset
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    const asset = await Asset.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    // Convert to plain object and add id field
    const formattedAsset = { ...asset, id: asset._id.toString() };
    
    // Fetch stock prices and calculate current valuation if symbol exists
    if (formattedAsset.symbol) {
      const stocksData = await getStockPrices([formattedAsset.symbol]);
      const assetWithValuation = parseCurrentValuationOfAsset(formattedAsset, stocksData);
      return NextResponse.json(assetWithValuation);
    }
    
    return NextResponse.json(formattedAsset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update a specific asset
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    const body = await req.json();

    // Validate asset data
    const assetErrors = validateAssetData(body);
    if (Object.keys(assetErrors).length > 0) {
      return NextResponse.json(
        { error: assetErrors },
        { status: 400 }
      );
    }
    
    // Prevent updating userId
    delete body.userId;
    
    // Find and update the asset
    const asset = await Asset.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    ).lean();
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    // Convert to plain object and add id field
    const formattedAsset = { ...asset, id: asset._id.toString() };
    
    // Fetch stock prices and calculate current valuation if symbol exists
    if (formattedAsset.symbol) {
      const stocksData = await getStockPrices([formattedAsset.symbol]);
      const assetWithValuation = parseCurrentValuationOfAsset(formattedAsset, stocksData);
      return NextResponse.json(assetWithValuation);
    }
    
    return NextResponse.json(formattedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a specific asset
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    const asset = await Asset.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 