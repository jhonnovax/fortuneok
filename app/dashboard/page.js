import Dashboard from '@/components/Dashboard';
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Dashboard | ${config.appName}`,
  robots: {
    index: false,
    follow: false,
  },
});

export default function DashboardPage() {
  
  return (
    <Dashboard />
  );

}
