import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Tweet, Contributor } from "@/types";
import tweetsData from "@/data/tweets.json";
import contributorsData from "@/data/contributors.json";

const TWEETS_FILE = path.join(process.cwd(), "src/data/tweets.json");
const CONTRIBUTORS_FILE = path.join(process.cwd(), "src/data/contributors.json");

// Use Upstash Redis in production (Vercel injects KV_REST_API_URL via Upstash integration)
const useKV = !!process.env.KV_REST_API_URL;

async function getKV() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

// GET - fetch all tweets (used by the frontend to get live data)
export async function GET() {
  try {
    if (useKV) {
      const kv = await getKV();
      let data = await kv.get<{ tweets: Tweet[] }>("tweets");
      if (!data) {
        // First run: seed KV from the static JSON baked at build time
        data = tweetsData as { tweets: Tweet[] };
        await kv.set("tweets", data);
      }
      return NextResponse.json(data);
    }
    // Local dev: return static JSON
    return NextResponse.json(tweetsData);
  } catch (error) {
    console.error("GET tweets error:", error);
    return NextResponse.json({ error: "Failed to fetch tweets", detail: String(error) }, { status: 500 });
  }
}

// POST - add a new tweet
export async function POST(req: NextRequest) {
  try {
    const newTweet = await req.json();

    if (!newTweet.text || !newTweet.category) {
      return NextResponse.json({ error: "Tweet text and category are required" }, { status: 400 });
    }

    const tweet: Tweet = {
      id: String(Date.now()),
      text: newTweet.text,
      author: newTweet.author || { name: "Unknown", handle: "@unknown", avatar: "" },
      category: newTweet.category,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      retweets: 0,
      bookmarks: 0,
      tweetUrl: newTweet.tweetUrl || "",
      upvotes: 0,
      contributedBy: newTweet.contributedBy || undefined,
    };

    if (useKV) {
      const kv = await getKV();

      const data = await kv.get<{ tweets: Tweet[] }>("tweets") || { tweets: [] };
      data.tweets.unshift(tweet);
      await kv.set("tweets", data);

      if (newTweet.contributedBy?.handle) {
        const contribData = await kv.get<{ contributors: Contributor[] }>("contributors")
          || { contributors: contributorsData.contributors as Contributor[] };
        const handle = newTweet.contributedBy.handle;
        const existing = contribData.contributors.find(
          (c) => c.handle.toLowerCase() === handle.toLowerCase()
        );
        if (existing) {
          existing.tweetsAdded += 1;
        } else {
          contribData.contributors.push({
            handle,
            name: newTweet.contributedBy.name || handle.replace("@", ""),
            tweetsAdded: 1,
            joinedDate: new Date().toISOString().split("T")[0],
          });
        }
        await kv.set("contributors", contribData);
      }
    } else {
      // Local dev: write to JSON files
      const fileContent = fs.readFileSync(TWEETS_FILE, "utf-8");
      const data = JSON.parse(fileContent);
      const maxId = data.tweets.reduce(
        (max: number, t: { id: string }) => Math.max(max, parseInt(t.id) || 0), 0
      );
      tweet.id = String(maxId + 1);
      data.tweets.unshift(tweet);
      fs.writeFileSync(TWEETS_FILE, JSON.stringify(data, null, 2) + "\n");

      if (newTweet.contributedBy?.handle) {
        const contribContent = fs.readFileSync(CONTRIBUTORS_FILE, "utf-8");
        const contribData = JSON.parse(contribContent);
        const handle = newTweet.contributedBy.handle;
        const existing = contribData.contributors.find(
          (c: { handle: string }) => c.handle.toLowerCase() === handle.toLowerCase()
        );
        if (existing) {
          existing.tweetsAdded += 1;
        } else {
          contribData.contributors.push({
            handle,
            name: newTweet.contributedBy.name || handle.replace("@", ""),
            tweetsAdded: 1,
            joinedDate: new Date().toISOString().split("T")[0],
          });
        }
        fs.writeFileSync(CONTRIBUTORS_FILE, JSON.stringify(contribData, null, 2) + "\n");
      }
    }

    return NextResponse.json({ success: true, tweet });
  } catch (error) {
    console.error("Save tweet error:", error);
    return NextResponse.json({ error: "Failed to save tweet", detail: String(error) }, { status: 500 });
  }
}
