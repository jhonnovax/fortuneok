import Dashboard from '@/components/Dashboard';
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `FortuneOK | Dashboard`,
});

export default function DashboardPage() {
  
  return (
    <Dashboard />
  );

}
