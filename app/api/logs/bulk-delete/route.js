import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Log from "@/models/Log";
import { authOptions } from "@/libs/next-auth";

// POST - Bulk delete logs
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is authorized (JhonNova or jhonnovax@gmail.com)
    const allowedUsers = ["JhonNova", "jhonnovax@gmail.com"];
    const isAuthorized =
      allowedUsers.includes(session.user.name) ||
      allowedUsers.includes(session.user.email);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { logIds } = body;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json(
        { error: "logIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Validate all IDs are valid ObjectIds
    const validIds = logIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid log IDs provided" },
        { status: 400 }
      );
    }

    // Delete logs
    const result = await Log.deleteMany({ _id: { $in: validIds } });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} log(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting logs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete logs" },
      { status: 500 }
    );
  }
}
