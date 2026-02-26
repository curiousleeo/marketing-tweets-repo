"use client";

import { useState, useEffect } from "react";
import { ContentItem } from "@/types";
import Image from "next/image";

interface ContentCardProps {
  item: ContentItem;
}

const categoryStyle: Record<string, { border: string; badge: string; dot: string }> = {
  // Marketing categories
  "Content Strategy": {
    border: "border-l-[#d4ff00]",
    badge: "bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/20",
    dot: "bg-[#d4ff00]",
  },
  "Personal Branding": {
    border: "border-l-[#38bdf8]",
    badge: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20",
    dot: "bg-[#38bdf8]",
  },
  "Community Building": {
    border: "border-l-[#fb923c]",
    badge: "bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/20",
    dot: "bg-[#fb923c]",
  },
  "Web3 Marketing": {
    border: "border-l-[#c084fc]",
    badge: "bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/20",
    dot: "bg-[#c084fc]",
  },
  "Copywriting": {
    border: "border-l-[#f472b6]",
    badge: "bg-[#f472b6]/10 text-[#f472b6] border-[#f472b6]/20",
    dot: "bg-[#f472b6]",
  },
  "Growth": {
    border: "border-l-[#4ade80]",
    badge: "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20",
    dot: "bg-[#4ade80]",
  },
  // Vibe Coding categories
  "AI Tools & Stacks": {
    border: "border-l-[#22d3ee]",
    badge: "bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/20",
    dot: "bg-[#22d3ee]",
  },
  "Prompting Tips": {
    border: "border-l-[#a78bfa]",
    badge: "bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/20",
    dot: "bg-[#a78bfa]",
  },
  "Workflow / Productivity": {
    border: "border-l-[#fbbf24]",
    badge: "bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20",
    dot: "bg-[#fbbf24]",
  },
  "Project Ideas": {
    border: "border-l-[#34d399]",
    badge: "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20",
    dot: "bg-[#34d399]",
  },
};

const fallbackStyle = {
  border: "border-l-[#555]",
  badge: "bg-[#333] text-[#aaa] border-[#444]",
  dot: "bg-[#555]",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getUpvotedItems(): Set<string> {
  try {
    const stored = localStorage.getItem("upvotedTweets");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveUpvotedItem(itemId: string) {
  try {
    const upvoted = getUpvotedItems();
    upvoted.add(itemId);
    localStorage.setItem("upvotedTweets", JSON.stringify(Array.from(upvoted)));
  } catch {
    // localStorage not available
  }
}

export default function ContentCard({ item }: ContentCardProps) {
  const [upvotes, setUpvotes] = useState(item.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [popped, setPopped] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [tweeting, setTweeting] = useState(false);

  const style = categoryStyle[item.category] || fallbackStyle;
  const isTweet = item.platform === "tweet";

  useEffect(() => {
    setHasUpvoted(getUpvotedItems().has(item.id));
  }, [item.id]);

  useEffect(() => {
    if (showPreview) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showPreview]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted || upvoting) return;
    setUpvoting(true);
    setPopped(true);
    setTimeout(() => setPopped(false), 300);
    try {
      const res = await fetch("/api/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, section: item.section }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpvotes(data.upvotes);
        setHasUpvoted(true);
        saveUpvotedItem(item.id);
      }
    } catch {
      // silently fail
    } finally {
      setUpvoting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/card/${item.id}/opengraph-image`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.author.handle.replace("@", "")}-tweet.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(`/card/${item.id}/opengraph-image`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleTweetWithImage = async () => {
    setTweeting(true);
    const cardUrl = `https://marketing-tweets-repo.vercel.app/card/${item.id}`;
    try {
      const res = await fetch(`/card/${item.id}/opengraph-image`);
      const blob = await res.blob();
      const file = new File([blob], `${item.author.handle.replace("@", "")}-tweet.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: `— ${item.author.handle}\n\nThe Content Vault\n${cardUrl}`,
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`— ${item.author.handle}\n\nThe Content Vault\n${cardUrl}`)}`,
          "_blank"
        );
      }, 600);
    } catch {
      // Share cancelled or failed
    } finally {
      setTweeting(false);
    }
  };

  const handleCardClick = () => {
    if (isTweet && item.tweetUrl) {
      window.open(item.tweetUrl, "_blank", "noopener,noreferrer");
    } else if (!isTweet && item.reelUrl) {
      window.open(item.reelUrl, "_blank", "noopener,noreferrer");
    }
  };

  const cardClass = `group relative bg-[#111] border border-[#1f1f1f] border-l-4 ${style.border} rounded-xl p-5 hover:border-[#2a2a2a] hover:bg-[#151515] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col`;

  return (
    <>
      <div className={cardClass} onClick={handleCardClick}>
        <div className="flex flex-col h-full">
          {/* Top row: category badge + platform badge + upvote */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${style.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {item.category}
              </span>
              {/* Platform badge */}
              {!isTweet && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[#e1306c]/10 text-[#e1306c] border border-[#e1306c]/20">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Reel
                </span>
              )}
            </div>

            {/* Upvote button */}
            <button
              onClick={handleUpvote}
              disabled={hasUpvoted || upvoting}
              title={hasUpvoted ? "Already upvoted" : "Upvote this"}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 min-w-[40px] ${
                hasUpvoted
                  ? "bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/30 cursor-default"
                  : "bg-[#1a1a1a] text-[#666] border-[#2a2a2a] hover:bg-[#d4ff00]/10 hover:text-[#d4ff00] hover:border-[#d4ff00]/30 active:scale-90"
              } ${popped ? "animate-pop" : ""}`}
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill={hasUpvoted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4L4 14h16L12 4z" />
              </svg>
              <span>{upvotes}</span>
            </button>
          </div>

          {/* Author row */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-[#2a2a2a]">
              <Image
                src={item.author.avatar}
                alt={item.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{item.author.name}</p>
              <p className="text-[#555] text-xs truncate">{item.author.handle}</p>
            </div>
          </div>

          {/* Text */}
          <p className="text-[#d0d0d0] text-[15px] leading-relaxed flex-1 line-clamp-6 mb-5">
            {item.text}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1f1f1f] mt-auto">
            <div>
              <span className="text-[#444] text-xs">{formatDate(item.date)}</span>
              {item.contributedBy && (
                <p className="text-[#444] text-xs mt-0.5">
                  by{" "}
                  <span className="text-[#d4ff00]/70">{item.contributedBy.handle}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {(isTweet ? item.tweetUrl : item.reelUrl) && (
                <span className="text-[#444] text-xs font-medium group-hover:text-[#d4ff00] transition-colors">
                  View →
                </span>
              )}
              {/* Share button — tweets only */}
              {isTweet && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
                  title="Share this tweet"
                  className="text-[#333] hover:text-[#d4ff00] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal — tweets only */}
      {isTweet && showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-[#d4ff00]/30">
                <Image src={item.author.avatar} alt={item.author.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-base">{item.author.name}</p>
                <p className="text-[#d4ff00] text-xs">{item.author.handle}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="ml-auto text-[#555] hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/card/${item.id}/opengraph-image`}
              alt={`Tweet card by ${item.author.name}`}
              className="w-full rounded-xl shadow-2xl mb-4"
              style={{ border: "1px solid #222" }}
            />

            <div className="flex gap-3">
              <button
                onClick={handleTweetWithImage}
                disabled={tweeting}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#d4ff00] hover:bg-[#c8f000] text-black font-bold rounded-xl transition-colors text-sm disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.76l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {tweeting ? "..." : "Tweet This"}
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#111] border border-[#2a2a2a] hover:bg-[#181818] text-white font-medium rounded-xl transition-colors text-sm disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloading ? "..." : "Download"}
              </button>

              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-3 bg-[#0d0d0d] border border-[#1f1f1f] hover:bg-[#111] text-[#555] hover:text-white rounded-xl transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
