import Dashboard from '@/components/Dashboard';
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Demo | ${config.appName}`,
  keywords: "investment tracker, portfolio tracker, personal finance app, wealth management, asset allocation, financial dashboard, demo data",
});

export default function DashboardPage() {
  
  return (
    <Dashboard />
  );

}
