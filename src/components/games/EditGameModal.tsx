"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateGame } from "@/actions/games";
import { useAppStore } from "@/stores/useAppStore";
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
  const updateGameStore = useAppStore((s) => s.updateGame);

  useEffect(() => {
    if (game) {
      setTitle(game.title);
      setCoverUrl(game.coverImageUrl || "");
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
