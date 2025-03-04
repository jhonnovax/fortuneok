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

// GET - Retrieve all transactions for a specific investment
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
    
    // Sort transactions by date (newest first)
    const transactions = investment.transactions.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add a new transaction to an investment
export async function POST(req, { params }) {
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
    
    // Validate required fields
    if (!body.date || !body.operation || !body.pricePerUnit) {
      return NextResponse.json(
        { error: "Date, operation, and pricePerUnit are required" },
        { status: 400 }
      );
    }
    
    // Find the investment
    const investment = await Investment.findOne({
      _id: id,
      userId: session.user.id,
    });
    
    if (!investment) {
      return NextResponse.json({ error: "Investment not found" }, { status: 404 });
    }
    
    // Add the new transaction
    investment.transactions.push(body);
    await investment.save();
    
    // Return the newly added transaction
    const newTransaction = investment.transactions[investment.transactions.length - 1];
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 