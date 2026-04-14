"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { deleteGame } from "@/actions/games";
import { useAppStore } from "@/stores/useAppStore";
import toast from "react-hot-toast";

interface DeleteGameDialogProps {
  gameId: string | null;
  gameTitle: string;
  questCount: number;
  onClose: () => void;
}

export function DeleteGameDialog({
  gameId,
  gameTitle,
  questCount,
  onClose,
}: DeleteGameDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const removeGame = useAppStore((s) => s.removeGame);

  async function handleDelete() {
    if (!gameId) return;

    setIsLoading(true);
    const result = await deleteGame(gameId);

    if (result.success) {
      removeGame(gameId);
      toast.success("Jogo removido!");
      onClose();
    } else {
      toast.error(result.error);
    }

    setIsLoading(false);
  }

  return (
    <Modal isOpen={!!gameId} onClose={onClose} title="Deletar Jogo">
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text-primary)]">
          Tem certeza que deseja deletar{" "}
          <strong>&quot;{gameTitle}&quot;</strong>?
        </p>
        {questCount > 0 && (
          <p className="text-sm text-[var(--color-error)]">
            Este jogo tem {questCount} quest{questCount > 1 ? "s" : ""}. Ao
            deletar, todas serão removidas permanentemente.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Deletar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
