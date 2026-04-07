"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { updateQuest } from "@/actions/quests";
import toast from "react-hot-toast";
import type { Quest } from "@/schema/quests";

interface EditQuestModalProps {
  quest: Quest | null;
  onClose: () => void;
  onUpdated: (quest: Quest) => void;
}

export function EditQuestModal({
  quest,
  onClose,
  onUpdated,
}: EditQuestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progressMax, setProgressMax] = useState("100");
  const [goldReward, setGoldReward] = useState("0");

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description || "");
      setProgressMax(String(quest.progressMax));
      setGoldReward(String(Number(quest.goldReward)));
      setErrors({});
    }
  }, [quest]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quest) return;

    setIsLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("progressMax", progressMax);
    formData.set("goldReward", goldReward);

    const result = await updateQuest(quest.id, formData);

    if (result.success) {
      onUpdated(result.data);
      toast.success("Quest atualizada!");
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

  const isActive = quest?.status === "active";

  return (
    <Modal isOpen={!!quest} onClose={onClose} title="Editar Quest">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Título da Quest"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={isLoading}
          required
        />

        <Textarea
          name="description"
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          disabled={isLoading}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              name="progressMax"
              type="number"
              label="Unidades para completar"
              value={progressMax}
              onChange={(e) => setProgressMax(e.target.value)}
              error={errors.progressMax}
              disabled={isLoading}
              min={1}
              max={9999}
              required
            />
            {isActive && (
              <p className="text-[10px] text-[#A1A1AA] mt-1">
                Progresso atual: {quest?.progress}
              </p>
            )}
          </div>
          <div>
            <Input
              name="goldReward"
              type="number"
              label="🪙 Ouro ao completar"
              value={goldReward}
              onChange={(e) => setGoldReward(e.target.value)}
              error={errors.goldReward}
              disabled={isLoading}
              min={0}
              step="0.01"
              required
            />
          </div>
        </div>

        {isActive && (
          <p className="text-xs text-[#71717A] bg-[#F4F4F5] rounded-[12px] px-3 py-2">
            Progresso só pode ser atualizado na página do jogo.
          </p>
        )}

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
