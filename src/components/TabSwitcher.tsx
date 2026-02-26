"use client";

import { Section } from "@/types";

interface TabSwitcherProps {
  activeTab: Section;
  onTabChange: (tab: Section) => void;
}

const tabs: { label: string; value: Section; emoji: string }[] = [
  { label: "Marketing", value: "marketing", emoji: "📢" },
  { label: "Vibe Coding", value: "vibe-coding", emoji: "⚡" },
];

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === tab.value
              ? "bg-[#d4ff00] text-black shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <span>{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
