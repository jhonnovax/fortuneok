import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Asset from "@/models/Asset";
import { authOptions } from "@/libs/next-auth";

// GET - Retrieve all assets for a specific user
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin (same check as in users layout)
    if (session.user.email !== 'jhonnovax@gmail.com') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { userId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    // Fetch all assets for the user, grouped by category
    const assets = await Asset.find({ userId })
      .select("_id date category description brokerName symbol shares currentValuation notes createdAt updatedAt")
      .sort({ category: 1, createdAt: -1 })
      .lean();
    
    // Group assets by category
    const assetsByCategory = {};
    assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = [];
      }
      assetsByCategory[asset.category].push({
        ...asset,
        id: asset._id.toString()
      });
    });
    
    // Format response
    const categories = Object.keys(assetsByCategory).map(category => ({
      category,
      count: assetsByCategory[category].length,
      assets: assetsByCategory[category]
    }));
    
    return NextResponse.json({
      userId,
      totalAssets: assets.length,
      totalCategories: categories.length,
      categories
    });
  } catch (error) {
    console.error("Error fetching user assets:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
