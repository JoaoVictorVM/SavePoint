"use client";

import { useAppStore } from "@/stores/useAppStore";
import { TagPill } from "@/components/tags/TagPill";
import { Button } from "@/components/ui/Button";

export function FilterBar() {
  const tags = useAppStore((s) => s.tags);
  const activeTagFilters = useAppStore((s) => s.activeTagFilters);
  const toggleTagFilter = useAppStore((s) => s.toggleTagFilter);
  const favoritesOnly = useAppStore((s) => s.favoritesOnly);
  const toggleFavoritesOnly = useAppStore((s) => s.toggleFavoritesOnly);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const clearAllFilters = useAppStore((s) => s.clearAllFilters);

  const hasActiveFilters =
    activeTagFilters.length > 0 || favoritesOnly || searchQuery.trim() !== "";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Tag chips */}
      {tags.map((tag) => (
        <TagPill
          key={tag.id}
          tag={tag}
          size="sm"
          selected={activeTagFilters.includes(tag.id)}
          onClick={() => toggleTagFilter(tag.id)}
        />
      ))}

      {/* Favorites toggle */}
      <button
        onClick={toggleFavoritesOnly}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer
          ${
            favoritesOnly
              ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]"
              : "border-[#E4E4E7] text-[#71717A] hover:border-[#D4D4D8]"
          }
        `}
      >
        <svg className="w-3.5 h-3.5" fill={favoritesOnly ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        Favoritos
      </button>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
