import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectMongo from "@/libs/mongoose";
import Asset from "@/models/Asset";
import { authOptions } from "@/libs/next-auth";
import { dummyData } from "./dummy-data";
import { getStockPrices } from "@/services/symbolService";
import { parseCurrentValuationOfAsset, validateAssetData } from "@/services/assetService";

// GET - Retrieve all assets for the current user
export async function GET() {
  
  try {
    const session = await getServerSession(authOptions);
    let assets = dummyData;
    
    if (session?.user) {
      await connectMongo();
      assets = await Asset.find({ userId: session.user.id }).lean(); // lean() Convert to plain objects since mongoose objects are not serializable
      assets = assets.map(asset => ({ ...asset, id: asset._id.toString() })); // Add id to each asset since mongoose returns _id instead of id
    }

    const stockSymbols = assets.filter((asset) => asset.symbol).map(asset => asset.symbol);
    const stocksData = await getStockPrices(stockSymbols);
    const formattedAssets = assets.map((asset) => parseCurrentValuationOfAsset(asset, stocksData));

    return NextResponse.json(formattedAssets);

  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

}

// POST - Create a new asset
export async function POST(req) {

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    
    // Create new asset
    const asset = await Asset.create({
      ...body,
      userId: session.user.id,
    });
    
    // Convert to plain object and add id field
    const assetObj = asset.toObject();
    const formattedAsset = { ...assetObj, id: assetObj._id.toString() };
    
    // Fetch stock prices and calculate current valuation if symbol exists
    if (formattedAsset.symbol) {
      const stocksData = await getStockPrices([formattedAsset.symbol]);
      const assetWithValuation = parseCurrentValuationOfAsset(formattedAsset, stocksData);
      return NextResponse.json(assetWithValuation, { status: 201 });
    }
    
    return NextResponse.json(formattedAsset, { status: 201 });

  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

} 