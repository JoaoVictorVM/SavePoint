"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createQuest } from "@/actions/quests";
import toast from "react-hot-toast";
import type { Quest } from "@/schema/quests";
import type { Game } from "@/schema/games";

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Pick<Game, "id" | "title">[];
  onCreated: (quest: Quest) => void;
}

export function AddQuestModal({ isOpen, onClose, games, onCreated }: AddQuestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gameId, setGameId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setGameId("");
    setTitle("");
    setDescription("");
    setErrors({});
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.set("gameId", gameId);
    formData.set("title", title);
    formData.set("description", description);

    const result = await createQuest(formData);

    if (result.success) {
      onCreated(result.data);
      toast.success("Quest criada!");
      handleClose();
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Quest">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Game select */}
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="quest-game" className="text-sm font-medium text-[#18181B]">
            Jogo vinculado
          </label>
          <select
            id="quest-game"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            disabled={isLoading}
            className={`
              w-full h-11 px-4 rounded-full
              border text-sm bg-white
              transition-all duration-[150ms] ease
              focus:outline-none focus:ring-2 focus:ring-[#06E09B] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.gameId ? "border-[#FF453A]" : "border-[#E4E4E7]"}
            `}
            required
          >
            <option value="">Selecione um jogo</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {errors.gameId && (
            <p className="text-xs text-[#FF453A] flex items-center gap-1" role="alert">
              <span>⚠</span> {errors.gameId}
            </p>
          )}
        </div>

        <Input
          name="title"
          label="Nome da Quest"
          placeholder="ex: Derrotar o dragão"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
          required
        />

        <Textarea
          name="description"
          label="Descrição (opcional)"
          placeholder="Descreva a quest..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Criar Quest
          </Button>
        </div>
      </form>
    </Modal>
  );
}
