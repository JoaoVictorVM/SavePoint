"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { AppShell } from "@/components/layout/AppShell";
import { TagPill } from "@/components/tags/TagPill";
import { TagPicker } from "@/components/tags/TagPicker";
import { TagManager } from "@/components/tags/TagManager";
import { PlatformManager } from "@/components/platforms/PlatformManager";
import { EditGameModal } from "@/components/games/EditGameModal";
import { DeleteGameDialog } from "@/components/games/DeleteGameDialog";
import { StarRating } from "@/components/ui/StarRating";
import { toggleFavorite } from "@/actions/games";
import { GAME_STATUS_LABELS } from "@/lib/game-constants";
import toast from "react-hot-toast";
import type { Game } from "@/schema/games";
import type { Tag } from "@/schema/tags";
import type { Platform } from "@/schema/platforms";
import type { GameStatus } from "@/lib/game-constants";
import type { UserSession, GameWithTags } from "@/lib/types";

interface GameDetailClientProps {
  initialUser: UserSession;
  initialGame: Game;
  initialTags: Tag[];
  initialPlatforms: Platform[];
  initialGameTags: Tag[];
}

export function GameDetailClient({
  initialUser,
  initialGame,
  initialTags,
  initialPlatforms,
  initialGameTags,
}: GameDetailClientProps) {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const user = useAppStore((s) => s.user);
  const openTagManager = useAppStore((s) => s.openTagManager);

  const [game, setGame] = useState(initialGame);
  const [gameTags, setGameTags] = useState(initialGameTags);
  const [imgError, setImgError] = useState(false);

  // Modals
  const [isEditGameOpen, setIsEditGameOpen] = useState(false);
  const [isDeleteGameOpen, setIsDeleteGameOpen] = useState(false);
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);

  const isTagManagerOpen = useAppStore((s) => s.isTagManagerOpen);
  const closeTagManager = useAppStore((s) => s.closeTagManager);
  const openPlatformManager = useAppStore((s) => s.openPlatformManager);
  const isPlatformManagerOpen = useAppStore((s) => s.isPlatformManagerOpen);
  const closePlatformManager = useAppStore((s) => s.closePlatformManager);
  const setTags = useAppStore((s) => s.setTags);
  const setPlatforms = useAppStore((s) => s.setPlatforms);
  const allTags = useAppStore((s) => s.tags);

  useEffect(() => {
    setUser(initialUser);
    setTags(initialTags);
    setPlatforms(initialPlatforms);
  }, [initialUser, initialTags, initialPlatforms, setUser, setTags, setPlatforms]);

  const gameForModal: GameWithTags = useMemo(
    () => ({ ...game, tags: gameTags }),
    [game, gameTags]
  );

  async function handleToggleFavorite() {
    setGame((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    const result = await toggleFavorite(game.id);
    if (!result.success) {
      setGame((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
      toast.error("Erro ao atualizar favorito");
    }
  }

  function handleGameUpdated(updatedGame: Partial<Game>) {
    setGame((prev) => ({ ...prev, ...updatedGame }));
    setIsEditGameOpen(false);
  }

  function handleGameDeleted() {
    router.push("/library");
  }

  const platforms = useAppStore((s) => s.platforms);
  const gamePlatform = game.platformId
    ? platforms.find((p) => p.id === game.platformId)
    : null;

  return (
    <AppShell
      username={user?.username || initialUser.username}
      goldBalance={user?.goldBalance ?? initialUser.goldBalance}
      onOpenTagManager={openTagManager}
      onOpenPlatformManager={openPlatformManager}
    >
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/library"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            ← Library
          </Link>
        </div>

        {/* Banner image */}
        <div className="relative w-full h-[200px] md:h-[260px] rounded-[16px] overflow-hidden mb-6">
          {game.coverImageUrl && !imgError ? (
            <Image
              src={game.coverImageUrl}
              alt={`Capa do jogo: ${game.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent)]/30 to-[var(--color-bg-base)]/40 flex items-center justify-center">
              <span className="text-6xl font-bold text-[var(--color-text-primary)]/30">
                {game.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Title row with action icons */}
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{game.title}</h1>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
              aria-label={game.isFavorite ? "Remover favorito" : "Favoritar"}
            >
              <svg
                className="w-5 h-5"
                fill={game.isFavorite ? "var(--color-gold)" : "none"}
                stroke="var(--color-gold)"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>
            <button
              onClick={() => setIsEditGameOpen(true)}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
              aria-label="Editar jogo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setIsDeleteGameOpen(true)}
              className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/5 transition-colors cursor-pointer"
              aria-label="Deletar jogo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {gameTags.map((tag) => (
            <TagPill key={tag.id} tag={tag} size="md" />
          ))}
          {gameTags.length < 5 && (
            <button
              onClick={() => setIsTagPickerOpen(!isTagPickerOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              + Tag
            </button>
          )}
        </div>

        {/* Tag Picker */}
        {isTagPickerOpen && (
          <div className="mb-6 p-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Selecionar Tags</h4>
              <button
                onClick={() => setIsTagPickerOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TagPicker
              allTags={allTags}
              assignedTags={gameTags}
              gameId={game.id}
              onTagsChanged={setGameTags}
            />
          </div>
        )}

        {/* Two-column layout: metadata left, review right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Metadata */}
          <div className="space-y-4">
            {/* Platform */}
            <div className="p-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Plataforma</h3>
              {gamePlatform ? (
                <TagPill tag={gamePlatform} size="md" />
              ) : (
                <span className="text-sm text-[var(--color-text-muted)]">Nenhuma</span>
              )}
            </div>

            {/* Status */}
            <div className="p-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Status</h3>
              {game.status ? (
                <span className="inline-flex px-3 py-1 rounded-full bg-[var(--color-bg-elevated)] text-sm font-medium text-[var(--color-text-primary)]">
                  {GAME_STATUS_LABELS[game.status as GameStatus]}
                </span>
              ) : (
                <span className="text-sm text-[var(--color-text-muted)]">Nenhum</span>
              )}
            </div>

            {/* Rating */}
            <div className="p-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Nota</h3>
              {game.rating ? (
                <StarRating value={Number(game.rating)} size="md" />
              ) : (
                <span className="text-sm text-[var(--color-text-muted)]">Sem nota</span>
              )}
            </div>
          </div>

          {/* Right: Review */}
          <div className="p-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] h-fit">
            <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Review</h3>
            {game.review ? (
              <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">{game.review}</p>
            ) : (
              <span className="text-sm text-[var(--color-text-muted)]">Nenhuma review ainda.</span>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditGameModal
        game={isEditGameOpen ? gameForModal : null}
        onClose={() => setIsEditGameOpen(false)}
      />
      <DeleteGameDialog
        gameId={isDeleteGameOpen ? game.id : null}
        gameTitle={game.title}
        questCount={0}
        onClose={() => {
          setIsDeleteGameOpen(false);
          handleGameDeleted();
        }}
      />
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={closeTagManager}
      />
      <PlatformManager
        isOpen={isPlatformManagerOpen}
        onClose={closePlatformManager}
      />
    </AppShell>
  );
}
