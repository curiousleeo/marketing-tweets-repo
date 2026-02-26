import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ContentItem, Contributor, Section } from "@/types";
import marketingData from "@/data/marketing.json";
import vibeCodingData from "@/data/vibe-coding.json";
import contributorsData from "@/data/contributors.json";

const MARKETING_FILE = path.join(process.cwd(), "src/data/marketing.json");
const VIBE_CODING_FILE = path.join(process.cwd(), "src/data/vibe-coding.json");
const CONTRIBUTORS_FILE = path.join(process.cwd(), "src/data/contributors.json");

const useKV = !!process.env.KV_REST_API_URL;

async function getKV() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

function kvKeyForSection(section: Section) {
  return `content:${section}`;
}

function staticDataForSection(section: Section) {
  return section === "marketing" ? marketingData : vibeCodingData;
}

function filePathForSection(section: Section) {
  return section === "marketing" ? MARKETING_FILE : VIBE_CODING_FILE;
}

// GET /api/content?section=marketing|vibe-coding
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = (searchParams.get("section") || "marketing") as Section;

  try {
    if (useKV) {
      const kv = await getKV();
      const kvKey = kvKeyForSection(section);
      let data = await kv.get<{ items: ContentItem[] }>(kvKey);

      if (!data) {
        // First run: check for old "tweets" key migration (marketing only)
        if (section === "marketing") {
          const oldData = await kv.get<{ tweets: ContentItem[] }>("tweets");
          if (oldData?.tweets) {
            // Migrate old data: add platform/section fields
            const migrated = oldData.tweets.map((t) => ({
              ...t,
              platform: "tweet" as const,
              section: "marketing" as const,
            }));
            data = { items: migrated };
          } else {
            data = staticDataForSection(section) as { items: ContentItem[] };
          }
        } else {
          data = staticDataForSection(section) as { items: ContentItem[] };
        }
        await kv.set(kvKey, data);
      }

      return NextResponse.json(data);
    }

    // Local dev: return static JSON
    return NextResponse.json(staticDataForSection(section));
  } catch (error) {
    console.error("GET content error:", error);
    return NextResponse.json({ error: "Failed to fetch content", detail: String(error) }, { status: 500 });
  }
}

// POST /api/content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const section = (body.section || "marketing") as Section;

    if (!body.text || !body.category || !body.platform) {
      return NextResponse.json({ error: "text, category, and platform are required" }, { status: 400 });
    }

    const item: ContentItem = {
      id: String(Date.now()),
      platform: body.platform,
      section,
      text: body.text,
      author: body.author || { name: "Unknown", handle: "@unknown", avatar: "" },
      category: body.category,
      date: new Date().toISOString().split("T")[0],
      upvotes: 0,
      contributedBy: body.contributedBy || undefined,
      ...(body.platform === "tweet" && {
        likes: 0,
        retweets: 0,
        bookmarks: 0,
        tweetUrl: body.tweetUrl || "",
      }),
      ...(body.platform === "reel" && {
        reelUrl: body.reelUrl || "",
        thumbnailUrl: body.thumbnailUrl || undefined,
      }),
    };

    if (useKV) {
      const kv = await getKV();
      const kvKey = kvKeyForSection(section);

      const data = await kv.get<{ items: ContentItem[] }>(kvKey) || { items: [] };
      data.items.unshift(item);
      await kv.set(kvKey, data);

      if (body.contributedBy?.handle) {
        const contribData = await kv.get<{ contributors: Contributor[] }>("contributors")
          || { contributors: contributorsData.contributors as Contributor[] };
        const handle = body.contributedBy.handle;
        const existing = contribData.contributors.find(
          (c) => c.handle.toLowerCase() === handle.toLowerCase()
        );
        if (existing) {
          existing.itemsAdded = (existing.itemsAdded || 0) + 1;
        } else {
          contribData.contributors.push({
            handle,
            name: body.contributedBy.name || handle.replace("@", ""),
            itemsAdded: 1,
            joinedDate: new Date().toISOString().split("T")[0],
          });
        }
        await kv.set("contributors", contribData);
      }
    } else {
      // Local dev: write to JSON files
      const filePath = filePathForSection(section);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      const maxId = data.items.reduce(
        (max: number, t: { id: string }) => Math.max(max, parseInt(t.id) || 0), 0
      );
      item.id = String(maxId + 1);
      data.items.unshift(item);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");

      if (body.contributedBy?.handle) {
        const contribContent = fs.readFileSync(CONTRIBUTORS_FILE, "utf-8");
        const contribData = JSON.parse(contribContent);
        const handle = body.contributedBy.handle;
        const existing = contribData.contributors.find(
          (c: { handle: string }) => c.handle.toLowerCase() === handle.toLowerCase()
        );
        if (existing) {
          existing.itemsAdded = (existing.itemsAdded || 0) + 1;
        } else {
          contribData.contributors.push({
            handle,
            name: body.contributedBy.name || handle.replace("@", ""),
            itemsAdded: 1,
            joinedDate: new Date().toISOString().split("T")[0],
          });
        }
        fs.writeFileSync(CONTRIBUTORS_FILE, JSON.stringify(contribData, null, 2) + "\n");
      }
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json({ error: "Failed to save content", detail: String(error) }, { status: 500 });
  }
}
