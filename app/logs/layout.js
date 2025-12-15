import "@/styles/app.css";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import LayoutClientPrivate from "@/components/LayoutClientPrivate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";

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
  // Only allow JhonNova (name) or jhonnovax@gmail.com (email)
  const allowedUsers = ["JhonNova", "jhonnovax@gmail.com"];
  const isAuthorized =
    session?.user &&
    (allowedUsers.includes(session.user.name) ||
      allowedUsers.includes(session.user.email));

  if (!isAuthorized) {
    redirect('/not-found');
  }

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );
}
