import "@/styles/app.css";
import LayoutClientPrivate from "@/components/LayoutClientPrivate";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  // If user is not logged in, redirect to home page
  // This must be outside try-catch because redirect() throws a special error
  if (!session) {
    redirect('/');
  }
  
  // Update lastAccessAt when user accesses the dashboard
  try {
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
    console.error("Error accessing updating lastAccessAt:", error);
  }

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );

}