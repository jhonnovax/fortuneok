import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Investment from "@/models/Investment";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET - Retrieve a specific investment
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid investment ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    const investment = await Investment.findOne({
      _id: id,
      userId: session.user.id,
    });
    
    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    return NextResponse.json(investment);
  } catch (error) {
    console.error("Error fetching investment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a specific investment
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid investment ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    const body = await req.json();
    
    // Prevent updating userId
    delete body.userId;
    
    // Find and update the investment
    const investment = await Investment.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    return NextResponse.json(investment);
  } catch (error) {
    console.error("Error updating investment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a specific investment
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid investment ID" }, { status: 400 });
    }
    
    await connectMongo();
    
    const investment = await Investment.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });
    
    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 