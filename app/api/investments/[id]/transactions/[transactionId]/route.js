import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Investment from "@/models/Investment";
import { authOptions } from "@/libs/next-auth";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// PUT - Update a specific transaction
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id, transactionId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(transactionId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    
    await connectMongo();
    
    const body = await req.json();
    
    // Find the investment
    const investment = await Investment.findOne({
      _id: id,
      userId: session.user.id,
    });
    
    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    // Find the transaction index
    const transactionIndex = investment.transactions.findIndex(
      (t) => t._id.toString() === transactionId
    );
    
    if (transactionIndex === -1) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    // Update the transaction
    Object.keys(body).forEach((key) => {
      investment.transactions[transactionIndex][key] = body[key];
    });
    
    await investment.save();
    
    return NextResponse.json(investment.transactions[transactionIndex]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a specific transaction
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id, transactionId } = params;
    
    if (!isValidObjectId(id) || !isValidObjectId(transactionId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    
    await connectMongo();
    
    // Find the investment and pull the transaction
    const result = await Investment.updateOne(
      { _id: id, userId: session.user.id },
      { $pull: { transactions: { _id: transactionId } } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 