import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Tweet } from "@/types";

const TWEETS_FILE = path.join(process.cwd(), "src/data/tweets.json");

const useKV = !!process.env.KV_REST_API_URL;

async function getKV() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { tweetId } = await req.json();

    if (!tweetId) {
      return NextResponse.json({ error: "tweetId is required" }, { status: 400 });
    }

    if (useKV) {
      const kv = await getKV();
      const data = await kv.get<{ tweets: Tweet[] }>("tweets");
      if (!data) return NextResponse.json({ error: "No tweets found" }, { status: 404 });

      const tweet = data.tweets.find((t) => t.id === String(tweetId));
      if (!tweet) return NextResponse.json({ error: "Tweet not found" }, { status: 404 });

      tweet.upvotes = (tweet.upvotes || 0) + 1;
      await kv.set("tweets", data);
      return NextResponse.json({ success: true, upvotes: tweet.upvotes });
    }

    // Local dev: JSON file
    const fileContent = fs.readFileSync(TWEETS_FILE, "utf-8");
    const data = JSON.parse(fileContent);
    const tweet = data.tweets.find((t: { id: string }) => t.id === String(tweetId));

    if (!tweet) {
      return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
    }

    tweet.upvotes = (tweet.upvotes || 0) + 1;
    fs.writeFileSync(TWEETS_FILE, JSON.stringify(data, null, 2) + "\n");
    return NextResponse.json({ success: true, upvotes: tweet.upvotes });
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ error: "Failed to upvote", detail: String(error) }, { status: 500 });
  }
}
