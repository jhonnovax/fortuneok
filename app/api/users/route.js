import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Asset from "@/models/Asset";
import { authOptions } from "@/libs/next-auth";
import clientPromise from "@/libs/mongo";

// GET - Retrieve all users with pagination and filters
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectMongo();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const emailVerified = searchParams.get("emailVerified");
    const hasAccess = searchParams.get("hasAccess");
    const sortField = searchParams.get("sortField") || "lastAccessAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";
    
    // Build filter conditions
    const filterConditions = [];
    
    // Search filter - search by _id, name, email, or customerId
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
      ];
      
      // Only add _id search if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }
      
      filterConditions.push({ $or: searchConditions });
    }
    
    // Boolean filters
    if (emailVerified !== null && emailVerified !== undefined && emailVerified !== "") {
      const emailVerifiedValue = emailVerified === "true";
      if (emailVerifiedValue) {
        // Filter for true: field exists, is not null, and has a date value
        filterConditions.push({
          emailVerified: { $exists: true, $ne: null }
        });
      } else {
        // Filter for false: field is null OR doesn't exist
        filterConditions.push({
          $or: [
            { emailVerified: null },
            { emailVerified: { $exists: false } }
          ]
        });
      }
    }
    
    if (hasAccess !== null && hasAccess !== undefined && hasAccess !== "") {
      const hasAccessValue = hasAccess === "true";
      if (hasAccessValue) {
        // Filter for true: field exists and is true
        filterConditions.push({ hasAccess: true });
      } else {
        // Filter for false: field is false OR doesn't exist (undefined)
        filterConditions.push({
          $or: [
            { hasAccess: false },
            { hasAccess: { $exists: false } },
            { hasAccess: null }
          ]
        });
      }
    }
    
    // Combine all filter conditions with $and
    const filter = filterConditions.length > 0 ? { $and: filterConditions } : {};
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Build sort object
    const sortOrder = sortDirection === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };
    
    // Fetch users with pagination, sorted by specified field and direction
    const users = await User.find(filter)
      .select("_id name email emailVerified hasAccess customerId createdAt lastAccessAt")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get asset statistics for each user
    const userIds = users.map(user => user._id);
    const assetStats = await Asset.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          totalAssets: { $sum: 1 },
          categories: { $addToSet: "$category" }
        }
      }
    ]);

    // Create a map of userId to asset stats
    const assetStatsMap = {};
    assetStats.forEach(stat => {
      assetStatsMap[stat._id.toString()] = {
        totalAssets: stat.totalAssets,
        totalCategories: stat.categories.length,
        categories: stat.categories
      };
    });

    // Get provider information from accounts collection
    // NextAuth stores accounts with userId referencing NextAuth's users collection
    // We need to match by email since our User model and NextAuth's users might have different IDs
    const client = await clientPromise;
    const db = client.db();
    const accountsCollection = db.collection("accounts");
    const nextAuthUsersCollection = db.collection("users");
    
    // Get user emails
    const userEmails = users.map(user => user.email).filter(Boolean);
    
    // First, get NextAuth users by email to get their IDs
    const nextAuthUsers = await nextAuthUsersCollection.find({
      email: { $in: userEmails }
    }).toArray();
    
    // Create a map of email to NextAuth userId
    const emailToNextAuthUserId = {};
    nextAuthUsers.forEach(naUser => {
      if (naUser.email) {
        emailToNextAuthUserId[naUser.email.toLowerCase()] = naUser._id;
      }
    });
    
    // Get all NextAuth userIds
    const nextAuthUserIds = Object.values(emailToNextAuthUserId);
    
    // Query accounts by NextAuth userId
    const accounts = await accountsCollection.find({
      userId: { $in: nextAuthUserIds }
    }).toArray();

    // Create a map of email to providers array
    const emailToProvidersMap = {};
    accounts.forEach(account => {
      if (account.userId) {
        // Find the email for this NextAuth userId
        const email = Object.keys(emailToNextAuthUserId).find(
          e => emailToNextAuthUserId[e].toString() === account.userId.toString()
        );
        if (email) {
          if (!emailToProvidersMap[email]) {
            emailToProvidersMap[email] = [];
          }
          // Add provider if not already in array
          if (!emailToProvidersMap[email].includes(account.provider)) {
            emailToProvidersMap[email].push(account.provider);
          }
        }
      }
    });

    // Format users to include id field, asset stats, and providers array
    const formattedUsers = users.map((user) => ({
      ...user,
      id: user._id.toString(),
      providers: user.email ? (emailToProvidersMap[user.email.toLowerCase()] || ['email']) : ['email'],
      assetStats: assetStatsMap[user._id.toString()] || {
        totalAssets: 0,
        totalCategories: 0,
        categories: []
      }
    }));
    
    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
