import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import Log from "@/models/Log";
import { authOptions } from "@/libs/next-auth";

// POST - Create a new log entry
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    // Validate required fields
    if (!body.errorMessage || !body.url) {
      return NextResponse.json(
        { error: "errorMessage and url are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Create log entry
    const logData = {
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || body.userEmail || null,
      userName: session?.user?.name || body.userName || null,
      action: body.action || "unknown",
      errorType: body.errorType || "error",
      errorMessage: body.errorMessage,
      errorStack: body.errorStack || null,
      url: body.url,
      userAgent: body.userAgent || req.headers.get("user-agent") || null,
      additionalData: body.additionalData || {},
      statusCode: body.statusCode || null,
      requestUrl: body.requestUrl || null,
      requestBody: body.requestBody || null,
      responseData: body.responseData || null,
    };

    // Only include requestMethod if it's provided and valid (exclude null/undefined)
    const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    if (
      body.requestMethod &&
      typeof body.requestMethod === "string" &&
      validMethods.includes(body.requestMethod.toUpperCase())
    ) {
      logData.requestMethod = body.requestMethod.toUpperCase();
    }
    // If requestMethod is null or invalid, we simply don't include it in logData

    const log = await Log.create(logData);

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create log" },
      { status: 500 }
    );
  }
}

// GET - Retrieve logs with pagination and filters
export async function GET(req) {
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

    await connectMongo();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const errorType = searchParams.get("errorType") || "";
    const userEmail = searchParams.get("userEmail") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // Build filter conditions
    const filterConditions = [];

    // Search filter - search by errorMessage, url, userEmail, or userName
    if (search) {
      const searchConditions = [
        { errorMessage: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ];

      // Only add _id search if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
        searchConditions.push({ userId: search });
      }

      filterConditions.push({ $or: searchConditions });
    }

    // Action filter
    if (action) {
      filterConditions.push({ action });
    }

    // Error type filter
    if (errorType) {
      filterConditions.push({ errorType });
    }

    // User email filter
    if (userEmail) {
      filterConditions.push({ userEmail: { $regex: userEmail, $options: "i" } });
    }

    // Combine all filter conditions with $and
    const filter = filterConditions.length > 0 ? { $and: filterConditions } : {};

    // Build sort object
    const sortOrder = sortDirection === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Fetch all logs (no pagination)
    const logs = await Log.find(filter)
      .sort(sort)
      .lean();

    // Format logs to include id field
    const formattedLogs = logs.map((log) => ({
      ...log,
      id: log._id.toString(),
    }));

    return NextResponse.json({
      logs: formattedLogs,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
