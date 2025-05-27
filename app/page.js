import config from '@/config';
import Portfolio from '@/components/Portfolio';
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `${config.appShortDescription} | ${config.appName}`,
  canonicalUrlRelative: "/"
});

export default function Home() {
  
  return (
    <Portfolio />
  );

}
