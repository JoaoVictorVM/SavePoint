"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createGame } from "@/actions/games";
import { useAppStore } from "@/stores/useAppStore";
import toast from "react-hot-toast";

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState("");
  const addGame = useAppStore((s) => s.addGame);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await createGame(formData);

    if (result.success) {
      addGame({ ...result.data, tags: [], activeQuest: null });
      toast.success("Jogo adicionado!");
      setCoverPreview("");
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

  function handleClose() {
    setErrors({});
    setCoverPreview("");
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
            <div className="mt-2 w-[60px] h-[80px] rounded-lg overflow-hidden border border-[#E4E4E7]">
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

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
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
