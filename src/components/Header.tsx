"use client";

interface HeaderProps {
  itemCount: number;
  authorCount: number;
}

export default function Header({ itemCount, authorCount }: HeaderProps) {
  return (
    <header className="mb-14">
      {/* Top label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#d4ff00] opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4ff00]"></span>
        </span>
        <span className="text-[#d4ff00] text-xs font-bold tracking-widest uppercase">
          Open Source · Community Curated
        </span>
      </div>

      {/* Main title */}
      <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
        <span className="text-white">The</span>{" "}
        <span className="text-[#d4ff00]">Content</span>
        <br />
        <span className="text-white">Vault.</span>
      </h1>

      {/* Divider */}
      <div className="accent-line w-24 mb-6" />

      {/* Description + stats in a row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <p className="text-[#888] text-base max-w-lg leading-relaxed">
          Real advice from real builders. Marketing wisdom and vibe coding
          insights — curated by the community.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{itemCount}</p>
            <p className="text-[#555] text-xs uppercase tracking-widest">Items</p>
          </div>
          <div className="w-px h-10 bg-[#1f1f1f]" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{authorCount}</p>
            <p className="text-[#555] text-xs uppercase tracking-widest">Authors</p>
          </div>
          <div className="w-px h-10 bg-[#1f1f1f]" />
          <div className="text-center">
            <p className="text-2xl font-black text-[#d4ff00]">∞</p>
            <p className="text-[#555] text-xs uppercase tracking-widest">Growing</p>
          </div>
        </div>
      </div>
    </header>
  );
}
