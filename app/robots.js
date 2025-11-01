import config from "@/config";

export default function robots() {

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/"],
    },
    sitemap: `https://${config.domainName}/sitemap.xml`,
  };

}
