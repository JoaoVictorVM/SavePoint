import type { Quest } from "@/schema/quests";

interface CompletedQuestCardProps {
  quest: Quest;
}

export function CompletedQuestCard({ quest }: CompletedQuestCardProps) {
  const completedDate = quest.completedAt
    ? new Date(quest.completedAt).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="rounded-[16px] border border-[#E4E4E7] bg-[#FAFAFA] p-4 opacity-75">
      <div className="flex items-start gap-3">
        <span className="mt-1 w-4 h-4 rounded-full bg-[#06E09B] flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#71717A] line-through truncate">
            {quest.title}
          </h4>
          <div className="flex items-center gap-4 mt-1 text-xs text-[#A1A1AA]">
            <span>Completada em: {completedDate}</span>
            <span className="text-[#06E09B] font-medium">
              🪙 +{Number(quest.goldReward).toFixed(2)}
            </span>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[#06E09B] font-semibold bg-[#06E09B]/10 px-2 py-0.5 rounded-full">
          Completa
        </span>
      </div>
    </div>
  );
}
