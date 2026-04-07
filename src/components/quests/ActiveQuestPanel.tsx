"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { updateQuestProgress, completeQuest, deactivateQuest } from "@/actions/quests";
import toast from "react-hot-toast";
import type { Quest } from "@/schema/quests";

interface ActiveQuestPanelProps {
  quest: Quest | null;
  onQuestUpdated: (quest: Quest) => void;
  onQuestCompleted: (quest: Quest, newGoldBalance: number, goldReward: number) => void;
  onQuestDeactivated: (quest: Quest) => void;
}

export function ActiveQuestPanel({
  quest,
  onQuestUpdated,
  onQuestCompleted,
  onQuestDeactivated,
}: ActiveQuestPanelProps) {
  const [progressInput, setProgressInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (quest) {
      setProgressInput(String(quest.progress));
    }
  }, [quest]);

  const sendProgressUpdate = useCallback(
    async (value: number) => {
      if (!quest) return;
      setIsUpdating(true);
      const result = await updateQuestProgress(quest.id, value);
      if (result.success) {
        onQuestUpdated(result.data);
      } else {
        toast.error(result.error);
        setProgressInput(String(quest.progress));
      }
      setIsUpdating(false);
    },
    [quest, onQuestUpdated]
  );

  function handleProgressChange(value: string) {
    setProgressInput(value);
    const num = parseInt(value, 10);
    if (isNaN(num) || !quest) return;
    if (num <= quest.progress || num > quest.progressMax) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sendProgressUpdate(num), 500);
  }

  function handleQuickIncrement(amount: number) {
    if (!quest) return;
    const newVal = Math.min(quest.progress + amount, quest.progressMax);
    if (newVal <= quest.progress) return;
    setProgressInput(String(newVal));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    sendProgressUpdate(newVal);
  }

  async function handleComplete() {
    if (!quest) return;
    setIsCompleting(true);
    const result = await completeQuest(quest.id);
    if (result.success) {
      const reward = result.data.goldReward;
      if (reward > 0) {
        toast.success(`Quest completa! +${reward.toFixed(2)} 🪙`);
      } else {
        toast.success("Quest completa!");
      }
      onQuestCompleted(result.data.quest, result.data.newGoldBalance, reward);
    } else {
      toast.error(result.error);
    }
    setIsCompleting(false);
  }

  async function handleDeactivate() {
    if (!quest) return;
    setIsDeactivating(true);
    const result = await deactivateQuest(quest.id);
    if (result.success) {
      onQuestDeactivated(result.data);
      toast.success("Quest desativada");
    } else {
      toast.error(result.error);
    }
    setIsDeactivating(false);
  }

  if (!quest) {
    return (
      <div className="rounded-[16px] border border-[#06E09B]/30 bg-[#06E09B]/5 p-6">
        <div className="text-center text-[#71717A]">
          <p className="font-medium">Nenhuma quest ativa</p>
          <p className="text-sm mt-1">
            Ative uma quest abaixo para rastrear seu progresso.
          </p>
        </div>
      </div>
    );
  }

  const isAtMax = quest.progress >= quest.progressMax;

  return (
    <div className="rounded-[16px] border border-[#06E09B]/30 bg-[#06E09B]/5 p-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#06E09B] font-semibold mb-1">
            Quest Ativa
          </p>
          <h3 className="text-xl font-bold text-[#18181B]">{quest.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#06E09B]/15 border border-[#06E09B] text-[#06E09B] text-xs font-semibold px-2.5 py-1 rounded-full">
            🪙 {Number(quest.goldReward).toFixed(2)}
          </span>
        </div>
      </div>

      {quest.description && (
        <p className="text-sm text-[#71717A] mb-4 max-h-20 overflow-y-auto">
          {quest.description}
        </p>
      )}

      {/* Progress section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#18181B]">Progresso</span>
          <span className="text-sm text-[#71717A] font-mono">
            {quest.progress} / {quest.progressMax}
          </span>
        </div>

        <ProgressBar
          value={quest.progress}
          max={quest.progressMax}
          showLabel
          size="lg"
          variant="active"
        />

        {/* Progress controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            value={progressInput}
            onChange={(e) => handleProgressChange(e.target.value)}
            min={quest.progress}
            max={quest.progressMax}
            disabled={isUpdating || isAtMax}
            className="w-24 h-9 px-3 rounded-full border border-[#E4E4E7] text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#06E09B] disabled:opacity-50"
            aria-label="Valor do progresso"
          />
          {[10, 25, 50].map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickIncrement(amount)}
              disabled={isUpdating || quest.progress + amount > quest.progressMax}
              className="h-9 px-3 rounded-full border border-[#E4E4E7] text-xs font-medium text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              +{amount}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleComplete}
          isLoading={isCompleting}
          className={isAtMax ? "animate-pulse" : ""}
        >
          Completar Quest
        </Button>
        <Button
          variant="ghost"
          onClick={handleDeactivate}
          isLoading={isDeactivating}
          size="sm"
        >
          Desativar
        </Button>
      </div>
    </div>
  );
}
