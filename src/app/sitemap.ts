import { MetadataRoute } from "next";
import marketingData from "@/data/marketing.json";

const SITE_URL = "https://thecontent-vault.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const tweetPages = (marketingData.items as { id: string; date: string }[]).map((item) => ({
    url: `${SITE_URL}/card/${item.id}`,
    lastModified: new Date(item.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...tweetPages,
  ];
}
