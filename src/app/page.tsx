"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ContentItem,
  Category,
  MarketingCategory,
  VibeCodingCategory,
  SortOption,
  Contributor,
  Section,
  Platform,
} from "@/types";
import marketingData from "@/data/marketing.json";
import vibeCodingData from "@/data/vibe-coding.json";
import contributorsData from "@/data/contributors.json";
import ContentCard from "@/components/ContentCard";
import FilterBar from "@/components/FilterBar";
import SearchBar from "@/components/SearchBar";
import SortDropdown from "@/components/SortDropdown";
import Header from "@/components/Header";
import AddContentModal from "@/components/AddContentModal";
import Contributors from "@/components/Contributors";
import AuthorsShowcase from "@/components/AuthorsShowcase";
import TabSwitcher from "@/components/TabSwitcher";
import PlatformToggle from "@/components/PlatformToggle";

const MARKETING_CATEGORIES: MarketingCategory[] = [
  "Content Strategy",
  "Personal Branding",
  "Community Building",
  "Web3 Marketing",
  "Copywriting",
  "Growth",
];

const VIBE_CODING_CATEGORIES: VibeCodingCategory[] = [
  "AI Tools & Stacks",
  "Prompting Tips",
  "Workflow / Productivity",
  "Project Ideas",
];

type PlatformFilter = Platform | "all";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Section>("marketing");
  const [activePlatform, setActivePlatform] = useState<PlatformFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [showAddModal, setShowAddModal] = useState(false);

  const [marketingItems, setMarketingItems] = useState<ContentItem[]>(
    marketingData.items as ContentItem[]
  );
  const [vibeCodingItems, setVibeCodingItems] = useState<ContentItem[]>(
    vibeCodingData.items as ContentItem[]
  );
  const [contributors, setContributors] = useState<Contributor[]>(
    contributorsData.contributors as Contributor[]
  );

  const fetchSection = useCallback((section: Section) => {
    fetch(`/api/content?section=${section}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          if (section === "marketing") setMarketingItems(data.items);
          else setVibeCodingItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  const fetchContributors = useCallback(() => {
    fetch("/api/contributors")
      .then((r) => r.json())
      .then((data) => { if (data.contributors) setContributors(data.contributors); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSection("marketing");
    fetchSection("vibe-coding");
    fetchContributors();
  }, [fetchSection, fetchContributors]);

  const handleContentAdded = useCallback(() => {
    fetchSection(activeTab);
    fetchContributors();
  }, [activeTab, fetchSection, fetchContributors]);

  const handleTabChange = useCallback((tab: Section) => {
    setActiveTab(tab);
    setSelectedCategory("All");
    setActivePlatform("all");
    setSearchQuery("");
  }, []);

  const activeItems = activeTab === "marketing" ? marketingItems : vibeCodingItems;
  const activeCategories: Category[] = activeTab === "marketing" ? MARKETING_CATEGORIES : VIBE_CODING_CATEGORIES;

  const authorCount = useMemo(() => {
    const handles = new Set(activeItems.map((t) => t.author.handle.toLowerCase()));
    return handles.size;
  }, [activeItems]);

  const totalItemCount = marketingItems.length + vibeCodingItems.length;
  const totalAuthorCount = useMemo(() => {
    const all = [...marketingItems, ...vibeCodingItems];
    return new Set(all.map((t) => t.author.handle.toLowerCase())).size;
  }, [marketingItems, vibeCodingItems]);

  const filteredItems = useMemo(() => {
    let result = [...activeItems];

    if (activePlatform !== "all") {
      result = result.filter((item) => item.platform === activePlatform);
    }

    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.text.toLowerCase().includes(query) ||
          item.author.name.toLowerCase().includes(query) ||
          item.author.handle.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "upvotes":
          return (b.upvotes || 0) - (a.upvotes || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [activeItems, activePlatform, selectedCategory, searchQuery, sortBy]);

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Header itemCount={totalItemCount} authorCount={totalAuthorCount} />

        {/* Tab Switcher */}
        <div className="mb-8">
          <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <div className="flex gap-2 shrink-0 items-center flex-wrap">
              <PlatformToggle activePlatform={activePlatform} onChange={setActivePlatform} />
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#d4ff00] hover:bg-[#c5f000] text-black font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Content
              </button>
            </div>
          </div>

          <FilterBar
            categories={activeCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Results count */}
        <div className="flex items-center gap-3 mb-6">
          <p className="text-[#555] text-sm">
            <span className="text-white font-semibold">{filteredItems.length}</span>{" "}
            {filteredItems.length === 1 ? "item" : "items"}
            {selectedCategory !== "All" && (
              <span> in <span className="text-[#d4ff00]">{selectedCategory}</span></span>
            )}
          </p>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
        </div>

        {/* Content Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <ContentCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">—</p>
            <h3 className="text-lg font-bold text-white mb-2">Nothing here yet</h3>
            <p className="text-[#555] text-sm">
              {activeTab === "vibe-coding" && activeItems.length === 0
                ? "Be the first to add vibe coding content!"
                : "Try a different search or filter"}
            </p>
          </div>
        )}

        <AuthorsShowcase items={activeItems} />
        <Contributors contributors={contributors} />

        <footer className="mt-20 pt-8 border-t border-[#1a1a1a]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#333] text-sm font-bold tracking-widest uppercase">
              The Content Vault
            </p>
            <p className="text-[#333] text-xs">
              Open source · Add your favorites · Upvote the best
            </p>
          </div>
        </footer>
      </div>

      <AddContentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={handleContentAdded}
        activeSection={activeTab}
      />
    </main>
  );
}
