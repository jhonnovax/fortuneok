import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectMongo from "@/libs/mongoose";
import Log from "@/models/Log";
import { authOptions } from "@/libs/next-auth";

// DELETE - Remove a specific log entry
export async function DELETE(req, { params }) {
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

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
    }

    await connectMongo();

    const log = await Log.findByIdAndDelete(id);

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete log" },
      { status: 500 }
    );
  }
}
