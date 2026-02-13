import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://distribuia.es";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/settings", "/billing", "/history", "/access"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
