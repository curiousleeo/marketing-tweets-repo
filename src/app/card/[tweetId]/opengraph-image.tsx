import { ImageResponse } from "next/og";
import { Redis } from "@upstash/redis";
import marketingData from "@/data/marketing.json";
import { ContentItem } from "@/types";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const categoryColors: Record<string, string> = {
  "Content Strategy": "#d4ff00",
  "Personal Branding": "#38bdf8",
  "Community Building": "#fb923c",
  "Web3 Marketing": "#c084fc",
  "Copywriting": "#f472b6",
  "Growth": "#4ade80",
};

async function getTweet(tweetId: string): Promise<ContentItem | null> {
  if (process.env.KV_REST_API_URL) {
    try {
      const kv = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      });
      const data = await kv.get<{ items: ContentItem[] }>("content:marketing");
      if (data?.items) {
        return data.items.find((t) => t.id === tweetId) ?? null;
      }
    } catch {
      // fall through to static JSON
    }
  }
  return (marketingData.items as ContentItem[]).find((t) => t.id === tweetId) ?? null;
}

export default async function Image({
  params,
}: {
  params: { tweetId: string };
}) {
  const tweet = await getTweet(params.tweetId);

  if (!tweet) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#050505",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#555", fontSize: "24px" }}>Not found</span>
        </div>
      ),
      { ...size }
    );
  }

  const accent = categoryColors[tweet.category] || "#d4ff00";
  const text = tweet.text.length > 280 ? tweet.text.substring(0, 277) + "..." : tweet.text;
  const fontSize = text.length > 200 ? "22px" : text.length > 120 ? "26px" : "30px";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderLeft: `12px solid ${accent}`,
        }}
      >
        {/* Top: Author hero */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            padding: "44px 72px 32px 72px",
            borderBottom: `1px solid ${accent}18`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tweet.author.avatar}
            alt={tweet.author.name}
            width={72}
            height={72}
            style={{
              borderRadius: "50%",
              border: `3px solid ${accent}`,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            <span style={{ color: "#ffffff", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {tweet.author.name}
            </span>
            <span style={{ color: accent, fontSize: "15px", fontWeight: "600" }}>
              {tweet.author.handle}
            </span>
          </div>
          {/* Category pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: `${accent}15`,
              border: `1px solid ${accent}30`,
            }}
          >
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: accent }} />
            <span style={{ color: accent, fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
              {tweet.category}
            </span>
          </div>
        </div>

        {/* Tweet text */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "36px 72px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "20px",
              left: "64px",
              color: accent,
              fontSize: "72px",
              fontWeight: "900",
              lineHeight: 1,
              opacity: 0.2,
            }}
          >
            &ldquo;
          </span>
          <p
            style={{
              color: "#e8e8e8",
              fontSize,
              lineHeight: 1.6,
              fontWeight: "500",
              paddingLeft: "16px",
            }}
          >
            {text}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "16px 72px 24px",
            gap: "8px",
          }}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d4ff00" }} />
          <span
            style={{
              color: "#444",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            The Content Vault
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
