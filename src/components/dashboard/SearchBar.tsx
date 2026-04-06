"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";

export function SearchBar() {
  const [value, setValue] = useState("");
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, setSearchQuery]);

  return (
    <div className="relative max-w-[400px] w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar jogos..."
        className="w-full h-10 pl-9 pr-8 rounded-full border border-[#E4E4E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#06E09B] focus:border-transparent transition-all"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] cursor-pointer"
          aria-label="Limpar busca"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
