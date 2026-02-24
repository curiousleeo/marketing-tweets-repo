import { NextResponse } from "next/server";
import { Contributor } from "@/types";
import contributorsData from "@/data/contributors.json";

const useKV = !!process.env.UPSTASH_REDIS_REST_URL;

async function getKV() {
  const { Redis } = await import("@upstash/redis");
  return Redis.fromEnv();
}

export async function GET() {
  try {
    if (useKV) {
      const kv = await getKV();
      const data = await kv.get<{ contributors: Contributor[] }>("contributors")
        || { contributors: contributorsData.contributors as Contributor[] };
      return NextResponse.json(data);
    }
    return NextResponse.json(contributorsData);
  } catch (error) {
    console.error("GET contributors error:", error);
    return NextResponse.json({ error: "Failed to fetch contributors", detail: String(error) }, { status: 500 });
  }
}
