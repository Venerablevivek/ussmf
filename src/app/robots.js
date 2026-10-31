import { appUrl } from "@/server/env";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/admin", "/apply", "/reset-password", "/verify/"],
      },
    ],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
