import Portfolio from '@/components/Portfolio';
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags();

export default function Dashboard() {
  
  return (
    <Portfolio />
  );

}
