"use client";

import { memo, useState } from "react";
import { toggleQuestComplete, deleteQuest } from "@/actions/quests";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { Quest } from "@/schema/quests";

interface QuestItemProps {
  quest: Quest;
  onToggled: (quest: Quest, newGoldBalance: number) => void;
  onDeleted: (questId: string) => void;
  onEdit: (quest: Quest) => void;
}

function QuestItemImpl({ quest, onToggled, onDeleted, onEdit }: QuestItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleToggle() {
    setIsToggling(true);
    const result = await toggleQuestComplete(quest.id);
    if (result.success) {
      onToggled(result.data.quest, result.data.newGoldBalance);
    } else {
      toast.error(result.error);
    }
    setIsToggling(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteQuest(quest.id);
    if (result.success) {
      onDeleted(quest.id);
      toast.success("Quest removida!");
      setIsDeleteOpen(false);
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <>
      <div className="group flex items-start gap-3 py-2.5 px-3 rounded-[12px] hover:bg-[var(--color-bg-hover)]/50 transition-colors">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="mt-0.5 shrink-0 cursor-pointer disabled:cursor-wait"
          aria-label={quest.completed ? "Desmarcar quest" : "Completar quest"}
        >
          {quest.completed ? (
            <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                quest.completed
                  ? "line-through text-[var(--color-text-muted)]"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {quest.title}
            </span>

            {/* Actions — edit only for non-completed */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
              {!quest.completed && (
                <button
                  onClick={() => onEdit(quest)}
                  className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                  aria-label="Editar quest"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/5 transition-colors cursor-pointer"
                aria-label="Excluir quest"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          {quest.description && (
            <p
              className={`text-xs mt-0.5 ${
                quest.completed ? "text-[var(--color-text-muted)]/60" : "text-[var(--color-text-muted)]"
              }`}
            >
              {quest.description}
            </p>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Excluir Quest">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-primary)]">
            Tem certeza que deseja excluir{" "}
            <strong>&quot;{quest.title}&quot;</strong>?
          </p>
          {quest.completed && (
            <p className="text-sm text-[var(--color-error)]">
              Esta quest está concluída. Ao excluir, 1 ouro será removido do seu saldo.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export const QuestItem = memo(QuestItemImpl);
