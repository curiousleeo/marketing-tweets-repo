"use client";

import { Category } from "@/types";

interface FilterBarProps {
  categories: Category[];
  selectedCategory: Category | "All";
  onCategoryChange: (category: Category | "All") => void;
}

const categoryDot: Record<string, string> = {
  "All": "bg-[#d4ff00]",
  "Content Strategy": "bg-[#d4ff00]",
  "Personal Branding": "bg-[#38bdf8]",
  "Community Building": "bg-[#fb923c]",
  "Web3 Marketing": "bg-[#c084fc]",
  "Copywriting": "bg-[#f472b6]",
  "Growth": "bg-[#4ade80]",
  "AI Tools & Stacks": "bg-[#22d3ee]",
  "Prompting Tips": "bg-[#a78bfa]",
  "Workflow / Productivity": "bg-[#fbbf24]",
  "Project Ideas": "bg-[#34d399]",
};

export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
}: FilterBarProps) {
  const allCategories: (Category | "All")[] = ["All", ...categories];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 min-w-max">
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                isSelected
                  ? "bg-[#1a1a1a] text-white border border-[#2f2f2f]"
                  : "text-[#666] hover:text-[#aaa] hover:bg-[#161616] border border-transparent"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 transition-opacity ${
                  categoryDot[category] || "bg-[#555]"
                } ${isSelected ? "opacity-100" : "opacity-40"}`}
              />
              {category}
              {isSelected && (
                <span className="absolute bottom-0 left-4 right-4 h-px bg-[#d4ff00] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
