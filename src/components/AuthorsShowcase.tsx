"use client";

import { ContentItem } from "@/types";

interface AuthorsShowcaseProps {
  items: ContentItem[];
}

interface AuthorInfo {
  name: string;
  handle: string;
  avatar: string;
  itemCount: number;
  hasTweet: boolean;
}

export default function AuthorsShowcase({ items }: AuthorsShowcaseProps) {
  const authorsMap = new Map<string, AuthorInfo>();
  items.forEach((item) => {
    const key = item.author.handle.toLowerCase();
    const existing = authorsMap.get(key);
    if (existing) {
      existing.itemCount += 1;
      if (item.platform === "tweet") existing.hasTweet = true;
    } else {
      authorsMap.set(key, {
        name: item.author.name,
        handle: item.author.handle,
        avatar: item.author.avatar,
        itemCount: 1,
        hasTweet: item.platform === "tweet",
      });
    }
  });

  const authors = Array.from(authorsMap.values()).sort((a, b) => b.itemCount - a.itemCount);
  if (authors.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#d4ff00] text-xs font-bold tracking-widest uppercase mb-2">
            Brilliant Minds
          </p>
          <h2 className="text-2xl font-black text-white">
            Featured Authors
          </h2>
        </div>
        <p className="text-[#555] text-sm hidden sm:block">
          Follow them for more insights
        </p>
      </div>

      <div className="accent-line mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {authors.map((author) => {
          const handle = author.handle.replace("@", "");
          const profileUrl = author.hasTweet ? `https://x.com/${handle}` : null;
          return profileUrl ? (
            <a
              key={author.handle}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-[#111] border border-[#1f1f1f] rounded-xl hover:border-[#2f2f2f] hover:bg-[#161616] transition-all duration-150"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full ring-2 ring-[#1f1f1f] group-hover:ring-[#d4ff00]/30 transition-all mb-3 object-cover"
              />
              <p className="text-white font-semibold text-xs text-center truncate w-full">{author.name}</p>
              <p className="text-[#555] text-xs truncate w-full text-center mb-2">{author.handle}</p>
              <span className="px-2 py-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-[#666] text-xs">
                {author.itemCount}×
              </span>
              <span className="mt-2 text-[10px] text-[#444] group-hover:text-[#d4ff00] transition-colors font-medium">
                Follow →
              </span>
            </a>
          ) : (
            <div
              key={author.handle}
              className="flex flex-col items-center p-4 bg-[#111] border border-[#1f1f1f] rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full ring-2 ring-[#1f1f1f] mb-3 object-cover"
              />
              <p className="text-white font-semibold text-xs text-center truncate w-full">{author.name}</p>
              <p className="text-[#555] text-xs truncate w-full text-center mb-2">{author.handle}</p>
              <span className="px-2 py-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-[#666] text-xs">
                {author.itemCount}×
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
