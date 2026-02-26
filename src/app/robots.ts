import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      // AI crawlers — allow indexing
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "Anthropic-AI",
          "ClaudeBot",
          "PerplexityBot",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://thecontent-vault.vercel.app/sitemap.xml",
  };
}
