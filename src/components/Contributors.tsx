"use client";

import { Contributor } from "@/types";

interface ContributorsProps {
  contributors: Contributor[];
}

export default function Contributors({ contributors }: ContributorsProps) {
  if (contributors.length === 0) return null;

  const sorted = [...contributors].sort((a, b) => (b.itemsAdded || 0) - (a.itemsAdded || 0));

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#d4ff00] text-xs font-bold tracking-widest uppercase mb-2">
            Open Source
          </p>
          <h2 className="text-2xl font-black text-white">
            Contributors
          </h2>
        </div>
        <p className="text-[#555] text-sm hidden sm:block">
          They built this together
        </p>
      </div>

      <div className="accent-line mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sorted.map((contributor) => {
          const handle = contributor.handle.replace("@", "");
          return (
            <a
              key={contributor.handle}
              href={`https://x.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center p-4 bg-[#111] border border-[#1f1f1f] rounded-xl hover:border-[#2f2f2f] hover:bg-[#161616] transition-all duration-150"
            >
              <img
                src={`https://unavatar.io/twitter/${handle}`}
                alt={contributor.name}
                className="w-12 h-12 rounded-full ring-2 ring-[#1f1f1f] group-hover:ring-[#d4ff00]/30 transition-all mb-3 object-cover"
              />
              <p className="text-white font-semibold text-xs text-center truncate w-full">
                {contributor.name}
              </p>
              <p className="text-[#555] text-xs truncate w-full text-center mb-2">
                {contributor.handle}
              </p>
              <span className="px-2 py-0.5 bg-[#d4ff00]/10 border border-[#d4ff00]/20 rounded-full text-[#d4ff00] text-xs font-medium">
                {contributor.itemsAdded || 0} added
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
