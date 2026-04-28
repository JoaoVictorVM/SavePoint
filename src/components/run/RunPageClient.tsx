"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/stores/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { TagManager } from "@/components/tags/TagManager";
import { PlatformManager } from "@/components/platforms/PlatformManager";
import { Button } from "@/components/ui/Button";
import { FilterPairRow } from "@/components/run/FilterPairRow";
import { RollAnimation } from "@/components/run/RollAnimation";
import type { UserSession, GameWithTags } from "@/lib/types";
import type { Tag } from "@/schema/tags";
import type { Platform } from "@/schema/platforms";
import type { RunFilterPair } from "@/lib/run-constants";

interface RunPageClientProps {
  initialUser: UserSession;
  initialGames: GameWithTags[];
  initialTags: Tag[];
  initialPlatforms: Platform[];
}

function newPair(): RunFilterPair {
  return {
    id: Math.random().toString(36).slice(2),
    category: "",
    values: [],
  };
}

export function RunPageClient({
  initialUser,
  initialGames,
  initialTags,
  initialPlatforms,
}: RunPageClientProps) {
  const setUser = useAppStore((s) => s.setUser);
  const setTags = useAppStore((s) => s.setTags);
  const setPlatforms = useAppStore((s) => s.setPlatforms);
  const openTagManager = useAppStore((s) => s.openTagManager);
  const openPlatformManager = useAppStore((s) => s.openPlatformManager);
  const isTagManagerOpen = useAppStore((s) => s.isTagManagerOpen);
  const closeTagManager = useAppStore((s) => s.closeTagManager);
  const isPlatformManagerOpen = useAppStore((s) => s.isPlatformManagerOpen);
  const closePlatformManager = useAppStore((s) => s.closePlatformManager);
  const user = useAppStore((s) => s.user);

  const [filterPairs, setFilterPairs] = useState<RunFilterPair[]>([newPair()]);
  const [result, setResult] = useState<GameWithTags | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setTags(initialTags);
    setPlatforms(initialPlatforms);
  }, [
    initialUser,
    initialTags,
    initialPlatforms,
    setUser,
    setTags,
    setPlatforms,
  ]);

  function applyFilters(): GameWithTags[] {
    let pool = [...initialGames];

    for (const pair of filterPairs) {
      if (!pair.category || pair.values.length === 0) continue;

      switch (pair.category) {
        case "favoritos":
          pool = pool.filter((g) => g.isFavorite);
          break;
        case "plataforma":
          pool = pool.filter(
            (g) => g.platformId && pair.values.includes(g.platformId),
          );
          break;
        case "tags":
          pool = pool.filter((g) =>
            g.tags.some((t) => pair.values.includes(t.id)),
          );
          break;
        case "status":
          pool = pool.filter((g) => g.status && pair.values.includes(g.status));
          break;
        case "nota":
          pool = pool.filter((g) => {
            if (!g.rating) return false;
            return pair.values.includes(String(Number(g.rating)));
          });
          break;
      }
    }

    return pool;
  }

  async function handleRoll() {
    const pool = applyFilters();

    if (pool.length === 0) {
      setNoResults(true);
      setResult(null);
      return;
    }

    setNoResults(false);
    setResult(null);
    setIsRolling(true);
    setImgError(false);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const picked = pool[Math.floor(Math.random() * pool.length)];
    setResult(picked);
    setIsRolling(false);
  }

  function updatePair(id: string, updated: RunFilterPair) {
    setFilterPairs((prev) => prev.map((p) => (p.id === id ? updated : p)));
    // Reset result/no-results on filter change
    setResult(null);
    setNoResults(false);
  }

  function removePair(id: string) {
    setFilterPairs((prev) => prev.filter((p) => p.id !== id));
    setResult(null);
    setNoResults(false);
  }

  function addPair() {
    setFilterPairs((prev) => [...prev, newPair()]);
  }

  return (
    <AppShell
      username={user?.username || initialUser.username}
      goldBalance={user?.goldBalance ?? initialUser.goldBalance}
      onOpenTagManager={openTagManager}
      onOpenPlatformManager={openPlatformManager}
    >
      <div className="p-6 md:p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Run
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Sorteie sua próxima jogatina.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Result area */}
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide self-start">
              Resultado
            </h2>

            {isRolling ? (
              <RollAnimation />
            ) : result ? (
              <Link
                href={`/games/${result.id}`}
                className="group block w-[220px] rounded-[16px] overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-200"
              >
                {/* Cover */}
                <div className="relative w-full h-[300px] bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-bg-base)]/10">
                  {result.coverImageUrl && !imgError ? (
                    <Image
                      src={result.coverImageUrl}
                      alt={result.title}
                      fill
                      className="object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-[var(--color-accent)]/40">
                        {result.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Title */}
                <div className="p-3 bg-[var(--color-bg-surface)]">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {result.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Clique para ver detalhes →
                  </p>
                </div>
              </Link>
            ) : noResults ? (
              <div className="w-[220px] h-[300px] rounded-[16px] border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-3 text-center p-6">
                <svg
                  className="w-10 h-10 text-[var(--color-text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Nenhum jogo corresponde aos filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="w-[220px] h-[300px] rounded-[16px] border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center gap-3 text-center p-6">
                <svg
                  className="w-10 h-10 text-[var(--color-text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
                  />
                </svg>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Para começar a sua próxima Run, clique em Sortear.
                </p>
              </div>
            )}

            {/* Sortear button */}
            <Button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-[220px]"
            >
              {isRolling ? "Sorteando..." : "Sortear"}
            </Button>
          </div>

          {/* Right: Filters area */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Filtros
            </h2>

            {filterPairs.map((pair) => (
              <FilterPairRow
                key={pair.id}
                pair={pair}
                allTags={initialTags}
                allPlatforms={initialPlatforms}
                onChange={(updated) => updatePair(pair.id, updated)}
                onRemove={() => removePair(pair.id)}
                canRemove={filterPairs.length > 1}
              />
            ))}

            <button
              type="button"
              onClick={addPair}
              className="w-full py-2.5 rounded-[16px] border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              + Adicionar Filtro
            </button>
          </div>
        </div>
      </div>

      <TagManager isOpen={isTagManagerOpen} onClose={closeTagManager} />
      <PlatformManager
        isOpen={isPlatformManagerOpen}
        onClose={closePlatformManager}
      />
    </AppShell>
  );
}
