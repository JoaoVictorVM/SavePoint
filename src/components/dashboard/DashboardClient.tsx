"use client";

import { useEffect, useState, useTransition } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TagManager } from "@/components/tags/TagManager";
import { PlatformManager } from "@/components/platforms/PlatformManager";
import { PeriodFilter } from "./PeriodFilter";
import { StatCard } from "./StatCard";
import { GoldStatCard } from "./GoldStatCard";
import { DonutChart } from "./DonutChart";
import { RatingDistribution } from "./RatingDistribution";
import { ReviewsCard } from "./ReviewsCard";
import { TimelineChart } from "./TimelineChart";
import { getDashboardData } from "@/actions/dashboard";
import { useAppStore } from "@/stores/useAppStore";
import type { DashboardData, DashboardPeriod } from "@/actions/dashboard";
import type { UserSession } from "@/lib/types";
import type { Tag } from "@/schema/tags";
import type { Platform } from "@/schema/platforms";

interface DashboardClientProps {
  initialUser: UserSession;
  initialData: DashboardData;
  initialTags: Tag[];
  initialPlatforms: Platform[];
}

export function DashboardClient({
  initialUser,
  initialData,
  initialTags,
  initialPlatforms,
}: DashboardClientProps) {
  const setUser = useAppStore((s) => s.setUser);
  const setTags = useAppStore((s) => s.setTags);
  const setPlatforms = useAppStore((s) => s.setPlatforms);

  const [period, setPeriod] = useState<DashboardPeriod>(initialData.period);
  const [data, setData] = useState<DashboardData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isPlatformManagerOpen, setIsPlatformManagerOpen] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setTags(initialTags);
    setPlatforms(initialPlatforms);
  }, [initialUser, initialTags, initialPlatforms, setUser, setTags, setPlatforms]);

  useEffect(() => {
    if (period === initialData.period && data === initialData) return;
    // period changed after initial — refetch
    startTransition(async () => {
      const fresh = await getDashboardData(period);
      setData(fresh);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <AppShell
      username={initialUser.username}
      goldBalance={initialUser.goldBalance}
      onOpenTagManager={() => setIsTagManagerOpen(true)}
      onOpenPlatformManager={() => setIsPlatformManagerOpen(true)}
    >
      <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Visão geral da sua jornada gamer
            </p>
          </div>
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            disabled={isPending}
          />
        </header>

        {/* Cards de métricas */}
        <section
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${
            isPending ? "opacity-60" : "opacity-100"
          }`}
        >
          <StatCard
            label="Jogos adicionados"
            value={data.totalGamesAdded}
            sublabel={periodSublabel(period)}
            accent
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />
          <StatCard
            label="Favoritados"
            value={data.favoritesAdded}
            sublabel="adicionados no período"
            icon={
              <svg
                className="w-4 h-4"
                fill="var(--color-gold)"
                stroke="var(--color-gold)"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            }
          />
          <StatCard
            label="Taxa de conclusão"
            value={`${data.completionRate}%`}
            sublabel={`${data.completionRatePrev}% no período anterior`}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <GoldStatCard
            goldEarned={data.goldEarned}
            goldEarnedPrev={data.goldEarnedPrev}
            changePercent={data.goldChangePercent}
          />
        </section>

        {/* Donuts */}
        <section
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${
            isPending ? "opacity-60" : "opacity-100"
          }`}
        >
          <DonutChart title="Por status" data={data.statusBreakdown} />
          <DonutChart title="Por plataforma" data={data.platformBreakdown} />
          <DonutChart title="Por tags" data={data.tagsBreakdown} />
        </section>

        {/* Distribuição de notas + Reviews */}
        <section
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${
            isPending ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="md:col-span-2">
            <RatingDistribution
              data={data.ratingDistribution}
              totalRated={data.ratedCount}
            />
          </div>
          <div className="md:col-span-1">
            <ReviewsCard
              count={data.reviewsCount}
              totalGames={data.totalGamesAdded}
            />
          </div>
        </section>

        {/* Timeline */}
        <section
          className={`transition-opacity ${
            isPending ? "opacity-60" : "opacity-100"
          }`}
        >
          <TimelineChart data={data.timeline} />
        </section>
      </div>

      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
      <PlatformManager
        isOpen={isPlatformManagerOpen}
        onClose={() => setIsPlatformManagerOpen(false)}
      />
    </AppShell>
  );
}

function periodSublabel(period: DashboardPeriod): string {
  if (period === "weekly") return "últimos 7 dias";
  if (period === "monthly") return "mês atual";
  return "ano atual";
}
