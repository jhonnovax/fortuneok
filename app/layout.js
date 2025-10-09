import "./globals.css";
import { Roboto } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import dynamic from 'next/dynamic';

// Dynamic imports for analytics (only load in production)
const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })), {
  ssr: false,
  loading: () => null
});

const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then(mod => ({ default: mod.SpeedInsights })), {
  ssr: false,
  loading: () => null
});
const fontRoboto = Roboto({
  weight: ['300','400','500','700'], // include weights you need
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
})

export const viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={fontRoboto.variable}
		>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>
					{children}
				</ClientLayout>

				{process.env.NODE_ENV === 'production' && (
					<>
						<Analytics />
						<SpeedInsights />
					</>
				)}
			</body>
		</html>
	);
}
