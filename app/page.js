import config from '@/config';
import Portfolio from '@/components/dashboard/Portfolio';

const title = config.appName;
const description = config.description;

export const metadata = {
  title,
  description,
  keywords: 'portfolio, investments, management, tracking, allocation, performance, stocks, shares, dashboard, analysis, savings, retirement, financial planning, wealth management',
  openGraph: {
    title,
    description,
    type: "website"
  },
  twitter: {
    title,
    description,
    card: "summary",
  },
};

export default function Dashboard() {
  
  return (
    <Portfolio />
  );

}
