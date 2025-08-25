import config from '@/config';
import Dashboard from '@/components/Dashboard';
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `${config.appShortDescription} | ${config.appName}`,
  canonicalUrlRelative: "/"
});

export default function Home() {
  
  return (
    <Dashboard />
  );

}
