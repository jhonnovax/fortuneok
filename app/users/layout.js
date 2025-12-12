import "@/styles/app.css";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import LayoutClientPrivate from "@/components/LayoutClientPrivate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";

export const metadata = getSEOTags({
  title: `Users | ${config.appName}`,
  robots: {
    index: false,
    follow: false,
  },
});

export default async function UsersLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  // Server-side authentication check - redirect before rendering to avoid flash
  if (!session?.user || session.user.email !== 'jhonnovax@gmail.com') {
    redirect('/not-found');
  }

  return (
    <LayoutClientPrivate>
      {children}
    </LayoutClientPrivate>
  );
}
