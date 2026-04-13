"use client";

import { FILTER_CATEGORIES, NOTA_VALUES } from "@/lib/run-constants";
import { GAME_STATUS_LABELS, GAME_STATUSES } from "@/lib/game-constants";
import type { RunFilterPair, FilterCategory } from "@/lib/run-constants";
import type { Tag } from "@/schema/tags";
import type { Platform } from "@/schema/platforms";

interface FilterPairRowProps {
  pair: RunFilterPair;
  allTags: Tag[];
  allPlatforms: Platform[];
  onChange: (pair: RunFilterPair) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function FilterPairRow({
  pair,
  allTags,
  allPlatforms,
  onChange,
  onRemove,
  canRemove,
}: FilterPairRowProps) {
  function handleCategoryChange(category: FilterCategory | "") {
    if (category === "favoritos") {
      onChange({ ...pair, category, values: ["favorito"] });
    } else {
      onChange({ ...pair, category, values: [] });
    }
  }

  function toggleValue(value: string) {
    const has = pair.values.includes(value);
    onChange({
      ...pair,
      values: has ? pair.values.filter((v) => v !== value) : [...pair.values, value],
    });
  }

  function getFilter2Options(): { value: string; label: string }[] {
    switch (pair.category) {
      case "favoritos":
        return [{ value: "favorito", label: "Favorito" }];
      case "plataforma":
        return allPlatforms.map((p) => ({ value: p.id, label: p.name }));
      case "tags":
        return allTags.map((t) => ({ value: t.id, label: t.name }));
      case "status":
        return GAME_STATUSES.map((s) => ({ value: s, label: GAME_STATUS_LABELS[s] }));
      case "nota":
        return NOTA_VALUES.map((n) => ({ value: n, label: `${n} ★` }));
      default:
        return [];
    }
  }

  const filter2Options = getFilter2Options();
  const isFavoritos = pair.category === "favoritos";

  return (
    <div className="p-4 rounded-[16px] border border-[#E4E4E7] bg-white space-y-3">
      {/* Header: label + remove */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#71717A] uppercase tracking-wide">Filtro</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded text-[#71717A] hover:text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer"
            aria-label="Remover filtro"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter 1: category select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[#71717A]">Filtro 1</label>
        <select
          value={pair.category}
          onChange={(e) => handleCategoryChange(e.target.value as FilterCategory | "")}
          className="w-full h-10 px-3 rounded-full border border-[#E4E4E7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#06E09B] focus:border-transparent"
        >
          <option value="">Selecionar categoria...</option>
          {FILTER_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter 2: checkboxes (only shown when category is selected) */}
      {pair.category && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-[#71717A]">Filtro 2</label>

          {isFavoritos ? (
            // Favoritos: single auto-checked, locked checkbox
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-4 rounded border-2 border-[#06E09B] bg-[#06E09B] flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-sm text-[#18181B]">Favorito</span>
            </div>
          ) : filter2Options.length === 0 ? (
            <p className="text-xs text-[#A1A1AA] px-1">
              {pair.category === "plataforma"
                ? "Nenhuma plataforma cadastrada."
                : pair.category === "tags"
                ? "Nenhuma tag cadastrada."
                : "Sem opções disponíveis."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {filter2Options.map((opt) => {
                const checked = pair.values.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? "border-[#06E09B] bg-[#06E09B]"
                          : "border-[#D4D4D8] bg-white group-hover:border-[#06E09B]"
                      }`}
                      onClick={() => toggleValue(opt.value)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm text-[#18181B] truncate"
                      onClick={() => toggleValue(opt.value)}
                    >
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
