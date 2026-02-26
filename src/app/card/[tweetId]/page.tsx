import { notFound } from "next/navigation";
import Link from "next/link";
import marketingData from "@/data/marketing.json";
import { ContentItem } from "@/types";

const SITE_URL = "https://marketing-tweets-repo.vercel.app";

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
      const { Redis } = await import("@upstash/redis");
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

export async function generateMetadata({
  params,
}: {
  params: { tweetId: string };
}) {
  const tweet = await getTweet(params.tweetId);
  if (!tweet) return { title: "Not found" };

  return {
    title: `${tweet.author.name} — The Content Vault`,
    description: tweet.text.substring(0, 160),
    twitter: {
      card: "summary_large_image",
      title: `${tweet.author.name} on The Content Vault`,
      description: tweet.text.substring(0, 160),
    },
    openGraph: {
      title: `${tweet.author.name} — The Content Vault`,
      description: tweet.text.substring(0, 160),
      type: "website",
    },
  };
}

export default async function CardPage({
  params,
}: {
  params: { tweetId: string };
}) {
  const tweet = await getTweet(params.tweetId);
  if (!tweet) notFound();

  const accent = categoryColors[tweet.category] || "#d4ff00";
  const cardUrl = `${SITE_URL}/card/${params.tweetId}`;
  const preview = tweet.text.length > 200
    ? tweet.text.substring(0, 197) + "..."
    : tweet.text;

  const tweetText = encodeURIComponent(
    `"${preview}"\n\n— ${tweet.author.name} (${tweet.author.handle})\n\nFound in The Content Vault\n${cardUrl}`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <main
      style={{ background: "#050505", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-2xl mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/card/${params.tweetId}/opengraph-image`}
          alt={`Tweet by ${tweet.author.name}`}
          className="w-full rounded-2xl shadow-2xl"
          style={{ border: `1px solid #1f1f1f` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 font-bold rounded-xl transition-colors text-sm"
          style={{ background: accent, color: "#000" }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.76l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Tweet This
        </a>

        <button
          id="copy-btn"
          className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#111] border border-[#2a2a2a] hover:bg-[#181818] text-white font-medium rounded-xl transition-colors text-sm"
          data-url={cardUrl}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Link
        </button>

        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0d0d0d] border border-[#1f1f1f] hover:bg-[#111] text-[#888] hover:text-white font-medium rounded-xl transition-colors text-sm"
        >
          ← Back to Vault
        </Link>
      </div>

      <p className="text-[#333] text-xs mt-8 tracking-widest uppercase">
        The Content Vault · Open Source
      </p>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('copy-btn').addEventListener('click', function() {
              navigator.clipboard.writeText(this.dataset.url).then(() => {
                this.textContent = '✓ Copied!';
                setTimeout(() => { this.innerHTML = '<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Copy Link'; }, 2000);
              });
            });
          `,
        }}
      />
    </main>
  );
}
