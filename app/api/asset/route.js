import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectMongo from "@/libs/mongoose";
import Asset from "@/models/Asset";
import { authOptions } from "@/libs/next-auth";
import { dummyData } from "./dummy-data";
import { getStockPrices } from "@/services/symbolService";
import { parseCurrentValuationOfAsset } from "@/services/assetService";

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
    
    // Validate required fields
    if (!body.category || !body.description) {
      return NextResponse.json(
        { error: "Category and description are required" },
        { status: 400 }
      );
    }
    
    // Create new asset
    const asset = await Asset.create({
      ...body,
      userId: session.user.id,
    });
    
    return NextResponse.json(asset, { status: 201 });

  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

} 