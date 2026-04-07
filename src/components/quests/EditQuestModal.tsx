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

export function EditQuestModal({ quest, onClose, onUpdated }: EditQuestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description || "");
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

  return (
    <Modal isOpen={!!quest} onClose={onClose} title="Editar Quest">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          label="Nome da Quest"
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
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
