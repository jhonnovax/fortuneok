import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectMongo from "@/libs/mongoose";
import Investment from "@/models/Investment";
import { authOptions } from "@/libs/next-auth";

// GET - Retrieve all investments for the current user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectMongo();
    
    const investments = await Investment.find({ userId: session.user.id });
    
    return NextResponse.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new investment
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
    
    // Create new investment with the current user's ID
    const investment = await Investment.create({
      ...body,
      userId: session.user.id,
    });
    
    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    console.error("Error creating investment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 