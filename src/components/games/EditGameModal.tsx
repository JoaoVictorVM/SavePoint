"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { updateGame } from "@/actions/games";
import { useAppStore } from "@/stores/useAppStore";
import { GAME_STATUSES, GAME_STATUS_LABELS } from "@/lib/game-constants";
import toast from "react-hot-toast";
import type { GameWithTags } from "@/lib/types";

interface EditGameModalProps {
  game: GameWithTags | null;
  onClose: () => void;
}

export function EditGameModal({ game, onClose }: EditGameModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const updateGameStore = useAppStore((s) => s.updateGame);
  const platforms = useAppStore((s) => s.platforms);

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setCoverUrl(game.coverImageUrl || "");
      setPlatformId(game.platformId || "");
      setStatus(game.status || "");
      setRating(game.rating ? Number(game.rating) : null);
      setReview(game.review || "");
      setErrors({});
    }
  }, [game]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!game) return;

    setIsLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.set("title", title);
    formData.set("coverImageUrl", coverUrl);
    formData.set("platformId", platformId);
    formData.set("status", status);
    if (rating !== null) {
      formData.set("rating", String(rating));
    }
    formData.set("review", review);

    const result = await updateGame(game.id, formData);

    if (result.success) {
      updateGameStore(game.id, result.data);
      toast.success("Jogo atualizado!");
      onClose();
    } else {
      if (result.fieldErrors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(result.fieldErrors)) {
          mapped[key] = msgs[0];
        }
        setErrors(mapped);
      } else {
        toast.error(result.error);
      }
    }

    setIsLoading(false);
  }

  return (
    <Modal isOpen={!!game} onClose={onClose} title="Editar Jogo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Título do Jogo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
          required
        />

        <div>
          <Input
            name="coverImageUrl"
            label="URL da Capa (opcional)"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            error={errors.coverImageUrl}
            disabled={isLoading}
          />
          {coverUrl && (
            <div className="mt-2 w-[60px] h-[80px] rounded-lg overflow-hidden border border-[#E4E4E7]">
              <img
                src={coverUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-platformId" className="text-sm font-medium text-[#18181B]">
            Plataforma (opcional)
          </label>
          <select
            id="edit-platformId"
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-full border border-[#E4E4E7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#06E09B] focus:border-transparent disabled:opacity-50"
          >
            <option value="">Nenhuma</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-status" className="text-sm font-medium text-[#18181B]">
            Status (opcional)
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-full border border-[#E4E4E7] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#06E09B] focus:border-transparent disabled:opacity-50"
          >
            <option value="">Nenhum</option>
            {GAME_STATUSES.map((s) => (
              <option key={s} value={s}>{GAME_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#18181B]">
            Nota (opcional)
          </label>
          <StarRating value={rating ?? 0} onChange={setRating} />
        </div>

        {/* Review */}
        <Textarea
          name="review"
          label="Review (opcional)"
          placeholder="O que você achou do jogo?"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          error={errors.review}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
