import "@/styles/app.css";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import LayoutClientPrivate from "@/components/LayoutClientPrivate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { isAuthorizedEmail } from "@/libs/authAccess";

export const metadata = getSEOTags({
  title: `Logs | ${config.appName}`,
  robots: {
    index: false,
    follow: false,
  },
});

export default async function LogsLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  // Server-side authentication check - redirect before rendering to avoid flash
  // Check if user's email is in the allowed admin emails list from environment variable
  const isAuthorized = session?.user?.email && isAuthorizedEmail(session.user.email);

  if (!isAuthorized) {
    redirect('/not-found');
  }

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );
}
