"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { activateQuest, deleteQuest } from "@/actions/quests";
import toast from "react-hot-toast";
import type { Quest } from "@/schema/quests";

interface QuestCardProps {
  quest: Quest;
  onActivated: (quest: Quest) => void;
  onDeleted: (questId: string) => void;
  onEdit: (questId: string) => void;
}

export function QuestCard({
  quest,
  onActivated,
  onDeleted,
  onEdit,
}: QuestCardProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleActivate() {
    setIsActivating(true);
    const result = await activateQuest(quest.id);
    if (result.success) {
      onActivated(result.data);
      toast.success("Quest ativada!");
    } else {
      toast.error(result.error);
    }
    setIsActivating(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteQuest(quest.id);
    if (result.success) {
      onDeleted(quest.id);
      toast.success("Quest removida!");
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <div className="rounded-[16px] border border-[#E4E4E7] bg-white p-4 hover:shadow-[var(--shadow-soft)] transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="mt-1 w-4 h-4 rounded-full border-2 border-[#E4E4E7] shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[#18181B] truncate">
              {quest.title}
            </h4>
            {quest.description && (
              <p className="text-sm text-[#71717A] mt-0.5 line-clamp-2">
                {quest.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-[#71717A]">
              <span className="flex items-center gap-1">
                🪙 {Number(quest.goldReward).toFixed(2)}
              </span>
              <span className="font-mono">
                {quest.progress}/{quest.progressMax}
              </span>
            </div>
            {quest.progress > 0 && (
              <div className="mt-2 max-w-[200px]">
                <ProgressBar
                  value={quest.progress}
                  max={quest.progressMax}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            onClick={handleActivate}
            isLoading={isActivating}
          >
            ▶ Ativar
          </Button>
        </div>
      </div>

      {/* Edit/Delete row */}
      <div className="flex justify-end gap-1 mt-2">
        <button
          onClick={() => onEdit(quest.id)}
          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
          aria-label="Editar quest"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF453A] hover:bg-[#FF453A]/5 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Deletar quest"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
