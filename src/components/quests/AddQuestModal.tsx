"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createQuest } from "@/actions/quests";
import toast from "react-hot-toast";
import type { Quest } from "@/schema/quests";

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  onCreated: (quest: Quest) => void;
}

export function AddQuestModal({
  isOpen,
  onClose,
  gameId,
  onCreated,
}: AddQuestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await createQuest(gameId, formData);

    if (result.success) {
      onCreated(result.data);
      toast.success("Quest criada!");
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
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Quest">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Título da Quest"
          placeholder="ex: Derrotar o dragão"
          error={errors.title}
          disabled={isLoading}
          required
        />

        <Textarea
          name="description"
          label="Descrição (opcional)"
          placeholder="Detalhes sobre a quest..."
          error={errors.description}
          disabled={isLoading}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              name="progressMax"
              type="number"
              label="Unidades para completar"
              placeholder="100"
              defaultValue="100"
              error={errors.progressMax}
              disabled={isLoading}
              min={1}
              max={9999}
              required
            />
          </div>
          <div>
            <Input
              name="goldReward"
              type="number"
              label="🪙 Ouro ao completar"
              placeholder="50.00"
              defaultValue="0"
              error={errors.goldReward}
              disabled={isLoading}
              min={0}
              step="0.01"
              required
            />
            <p className="text-[10px] text-[#A1A1AA] mt-1">
              Valor decimal. ex: 50.00
            </p>
          </div>
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
            Criar Quest
          </Button>
        </div>
      </form>
    </Modal>
  );
}
