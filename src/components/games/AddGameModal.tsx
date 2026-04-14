"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { createGame } from "@/actions/games";
import { useAppStore } from "@/stores/useAppStore";
import { GAME_STATUSES, GAME_STATUS_LABELS } from "@/lib/game-constants";
import toast from "react-hot-toast";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const addGame = useAppStore((s) => s.addGame);
  const platforms = useAppStore((s) => s.platforms);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    if (rating !== null) {
      formData.set("rating", String(rating));
    }

    const result = await createGame(formData);

    if (result.success) {
      addGame({ ...result.data, tags: [] });
      toast.success("Jogo adicionado!");
      resetForm();
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

  function resetForm() {
    setErrors({});
    setCoverPreview("");
    setRating(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Jogo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Título do Jogo"
          placeholder="ex: The Legend of Zelda"
          error={errors.title}
          disabled={isLoading}
          required
        />

        <div>
          <Input
            name="coverImageUrl"
            label="URL da Capa (opcional)"
            placeholder="https://exemplo.com/capa.jpg"
            error={errors.coverImageUrl}
            disabled={isLoading}
            onChange={(e) => setCoverPreview(e.target.value)}
          />
          {coverPreview && (
            <div className="mt-2 w-[60px] h-[80px] rounded-lg overflow-hidden border border-[var(--color-border)]">
              <img
                src={coverPreview}
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
          <label htmlFor="platformId" className="text-sm font-medium text-[var(--color-text-primary)]">
            Plataforma (opcional)
          </label>
          <select
            id="platformId"
            name="platformId"
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-full border border-[var(--color-border)] text-sm bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
          >
            <option value="">Nenhuma</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-[var(--color-text-primary)]">
            Status (opcional)
          </label>
          <select
            id="status"
            name="status"
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-full border border-[var(--color-border)] text-sm bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent disabled:opacity-50"
          >
            <option value="">Nenhum</option>
            {GAME_STATUSES.map((s) => (
              <option key={s} value={s}>{GAME_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            Nota (opcional)
          </label>
          <StarRating value={rating ?? 0} onChange={setRating} />
        </div>

        {/* Review */}
        <Textarea
          name="review"
          label="Review (opcional)"
          placeholder="O que você achou do jogo?"
          error={errors.review}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
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
