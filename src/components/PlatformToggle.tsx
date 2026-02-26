"use client";

import { Platform } from "@/types";

type PlatformFilter = Platform | "all";

interface PlatformToggleProps {
  activePlatform: PlatformFilter;
  onChange: (platform: PlatformFilter) => void;
}

const options: { label: string; value: PlatformFilter; icon: string }[] = [
  { label: "All", value: "all", icon: "✦" },
  { label: "Tweets", value: "tweet", icon: "𝕏" },
  { label: "Reels", value: "reel", icon: "▶" },
];

export default function PlatformToggle({ activePlatform, onChange }: PlatformToggleProps) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
            activePlatform === opt.value
              ? "bg-white/15 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <span className="text-[11px]">{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
