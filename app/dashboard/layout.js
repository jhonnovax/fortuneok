import "@/styles/app.css";
import LayoutClientPrivate from "@/components/LayoutClientPrivate";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export default async function DashboardLayout({ children }) {
  // Update lastAccessAt when user accesses the dashboard
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      await connectMongo();
      await User.findOneAndUpdate(
        { email: session.user.email },
        { lastAccessAt: new Date() },
        { upsert: false }
      );
    }
  } catch (error) {
    // Don't block dashboard access if update fails
    console.error("Error updating lastAccessAt:", error);
  }

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );

}