import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ContentItem, Section } from "@/types";

const MARKETING_FILE = path.join(process.cwd(), "src/data/marketing.json");
const VIBE_CODING_FILE = path.join(process.cwd(), "src/data/vibe-coding.json");

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
    const body = await req.json();
    const itemId = body.itemId || body.tweetId;
    const section = (body.section || "marketing") as Section;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    if (useKV) {
      const kv = await getKV();
      const kvKey = `content:${section}`;
      const data = await kv.get<{ items: ContentItem[] }>(kvKey);
      if (!data) return NextResponse.json({ error: "No content found" }, { status: 404 });

      const item = data.items.find((t) => t.id === String(itemId));
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

      item.upvotes = (item.upvotes || 0) + 1;
      await kv.set(kvKey, data);
      return NextResponse.json({ success: true, upvotes: item.upvotes });
    }

    // Local dev: JSON file
    const filePath = section === "marketing" ? MARKETING_FILE : VIBE_CODING_FILE;
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    const item = data.items.find((t: { id: string }) => t.id === String(itemId));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    item.upvotes = (item.upvotes || 0) + 1;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    return NextResponse.json({ success: true, upvotes: item.upvotes });
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ error: "Failed to upvote", detail: String(error) }, { status: 500 });
  }
}
