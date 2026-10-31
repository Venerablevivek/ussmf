import { appUrl } from "@/server/env";

export default function sitemap() {
  const base = appUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/verify`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
