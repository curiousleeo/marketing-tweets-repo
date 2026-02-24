import { ImageResponse } from "next/og";
import { Redis } from "@upstash/redis";
import tweetsData from "@/data/tweets.json";
import { Tweet } from "@/types";

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

async function getTweet(tweetId: string): Promise<Tweet | null> {
  if (process.env.KV_REST_API_URL) {
    try {
      const kv = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      });
      const data = await kv.get<{ tweets: Tweet[] }>("tweets");
      if (data?.tweets) {
        return data.tweets.find((t) => t.id === tweetId) ?? null;
      }
    } catch {
      // fall through to static JSON
    }
  }
  return (tweetsData.tweets as Tweet[]).find((t) => t.id === tweetId) ?? null;
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
  const text = tweet.text.length > 300 ? tweet.text.substring(0, 297) + "..." : tweet.text;
  const fontSize = text.length > 220 ? "24px" : text.length > 130 ? "28px" : "34px";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderLeft: `14px solid ${accent}`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 72px 0 72px",
          }}
        >
          {/* Category */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: accent,
              }}
            />
            <span
              style={{
                color: accent,
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              {tweet.category}
            </span>
          </div>

          {/* Big opening quote */}
          <div
            style={{
              color: accent,
              fontSize: "80px",
              lineHeight: 0.6,
              fontWeight: "900",
              marginBottom: "16px",
              opacity: 0.4,
            }}
          >
            &ldquo;
          </div>

          {/* Tweet text */}
          <div
            style={{
              color: "#eeeeee",
              fontSize,
              lineHeight: 1.55,
              fontWeight: "500",
              flex: 1,
            }}
          >
            {text}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 72px",
            borderTop: "1px solid #1a1a1a",
            marginTop: "24px",
          }}
        >
          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tweet.author.avatar}
              alt={tweet.author.name}
              width={52}
              height={52}
              style={{
                borderRadius: "50%",
                border: `2px solid ${accent}40`,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {tweet.author.name}
              </span>
              <span style={{ color: "#555", fontSize: "14px" }}>
                {tweet.author.handle}
              </span>
            </div>
          </div>

          {/* Vault brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#d4ff00",
              }}
            />
            <span
              style={{
                color: "#d4ff00",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Marketing Tweet Vault
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
