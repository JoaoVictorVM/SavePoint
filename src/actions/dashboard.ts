"use server";

import { and, between, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { games } from "@/schema/games";
import { tags } from "@/schema/tags";
import { platforms } from "@/schema/platforms";
import { gameTags } from "@/schema/gameTags";
import { quests } from "@/schema/quests";
import { getSession } from "@/lib/session";
import { GAME_STATUS_LABELS, type GameStatus } from "@/lib/game-constants";

export type DashboardPeriod = "weekly" | "monthly" | "yearly";

export interface DashboardBreakdownItem {
  label: string;
  value: number;
  color: string;
}

export interface DashboardTimelinePoint {
  label: string; // eixo X
  value: number; // jogos adicionados
}

export interface DashboardRatingBucket {
  rating: number; // 0.5 ... 5.0 ou null (sem nota, representado como -1)
  label: string;  // "0.5", "1.0", ... ou "Sem nota"
  value: number;
}

export interface DashboardData {
  period: DashboardPeriod;
  range: { start: string; end: string; previousStart: string; previousEnd: string };

  // Cards de métricas principais
  totalGamesAdded: number;
  favoritesAdded: number;
  completionRate: number; // 0..100 (% de zerados dentro do período)
  completionRatePrev: number; // para comparação visual (opcional)

  // Gold (bolsa de valores)
  goldEarned: number;
  goldEarnedPrev: number;
  goldChangePercent: number | null; // null se prev === 0 e current > 0 -> "+∞"

  // Breakdowns (donuts)
  statusBreakdown: DashboardBreakdownItem[];
  platformBreakdown: DashboardBreakdownItem[];
  tagsBreakdown: DashboardBreakdownItem[];

  // Rating distribution + reviews
  ratingDistribution: DashboardRatingBucket[];
  reviewsCount: number;
  ratedCount: number; // total de jogos com nota (para texto auxiliar)

  // Timeline
  timeline: DashboardTimelinePoint[];
}

// Paleta Nord para status (sem cor cadastrada pelo usuário)
const STATUS_COLORS: Record<GameStatus | "sem_status", string> = {
  jogando: "#A3BE8C",     // nord14 success — em andamento
  zerado: "#88C0D0",      // nord8 accent — concluído
  para_jogar: "#5E81AC",  // nord10 interactive — planejado
  abandonado: "#BF616A",  // nord11 error — desistido
  quero_jogar: "#EBCB8B", // nord13 warning — wishlist
  sem_status: "#4C566A",  // nord3 muted
};

const MISSING_COLOR = "#4C566A"; // nord3 muted

/**
 * Calcula o range do período atual e do período anterior equivalente.
 * - weekly: últimos 7 dias corridos vs 7 dias antes desses
 * - monthly: mês corrente vs mês anterior
 * - yearly: ano corrente vs ano anterior
 */
function computeRanges(period: DashboardPeriod) {
  const now = new Date();
  let start: Date;
  let end: Date;
  let previousStart: Date;
  let previousEnd: Date;

  if (period === "weekly") {
    end = now;
    start = new Date(now);
    start.setDate(start.getDate() - 6); // 7 dias contando hoje
    start.setHours(0, 0, 0, 0);
    previousEnd = new Date(start);
    previousEnd.setMilliseconds(-1);
    previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
    previousStart.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    previousStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  }

  return { start, end, previousStart, previousEnd };
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null; // null representa "sem base de comparação" -> exibir como +∞ ou "novo"
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Gera os buckets da timeline com valor zero (depois serão preenchidos).
 */
function buildTimelineBuckets(
  period: DashboardPeriod,
  start: Date
): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];

  if (period === "weekly") {
    // 7 pontos, 1 por dia
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      buckets.push({ key, label });
    }
  } else if (period === "monthly") {
    // 1 ponto por dia do mês
    const year = start.getFullYear();
    const month = start.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = d.toISOString().slice(0, 10);
      const label = String(day).padStart(2, "0");
      buckets.push({ key, label });
    }
  } else {
    // 12 pontos, 1 por mês
    const monthLabels = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez",
    ];
    const year = start.getFullYear();
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      buckets.push({ key, label: monthLabels[m] });
    }
  }

  return buckets;
}

function bucketKeyForDate(period: DashboardPeriod, date: Date): string {
  if (period === "yearly") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  return date.toISOString().slice(0, 10);
}

export async function getDashboardData(
  period: DashboardPeriod
): Promise<DashboardData> {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");

  const { start, end, previousStart, previousEnd } = computeRanges(period);

  // ---- 1. Jogos adicionados no período (e no anterior, para futuras comparações) ----
  const userGamesInPeriod = await db
    .select({
      id: games.id,
      status: games.status,
      platformId: games.platformId,
      isFavorite: games.isFavorite,
      createdAt: games.createdAt,
      rating: games.rating,
      review: games.review,
    })
    .from(games)
    .where(
      and(
        eq(games.userId, session.id),
        between(games.createdAt, start, end)
      )
    );

  const totalGamesAdded = userGamesInPeriod.length;
  const favoritesAdded = userGamesInPeriod.filter((g) => g.isFavorite).length;

  // ---- 2. Taxa de conclusão (zerados no período / total no período) ----
  const zeradosCount = userGamesInPeriod.filter((g) => g.status === "zerado").length;
  const completionRate =
    totalGamesAdded > 0 ? Math.round((zeradosCount / totalGamesAdded) * 100) : 0;

  // Período anterior (para comparação — não exibido, mas disponível)
  const userGamesPrev = await db
    .select({ status: games.status })
    .from(games)
    .where(
      and(
        eq(games.userId, session.id),
        between(games.createdAt, previousStart, previousEnd)
      )
    );
  const prevTotal = userGamesPrev.length;
  const prevZerados = userGamesPrev.filter((g) => g.status === "zerado").length;
  const completionRatePrev =
    prevTotal > 0 ? Math.round((prevZerados / prevTotal) * 100) : 0;

  // ---- 3. Gold ganho (1 por quest concluída) ----
  const goldRows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(quests)
    .innerJoin(games, eq(quests.gameId, games.id))
    .where(
      and(
        eq(games.userId, session.id),
        eq(quests.completed, true),
        gte(quests.completedAt, start),
        lte(quests.completedAt, end)
      )
    );
  const goldEarned = Number(goldRows[0]?.count ?? 0);

  const goldPrevRows = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(quests)
    .innerJoin(games, eq(quests.gameId, games.id))
    .where(
      and(
        eq(games.userId, session.id),
        eq(quests.completed, true),
        gte(quests.completedAt, previousStart),
        lte(quests.completedAt, previousEnd)
      )
    );
  const goldEarnedPrev = Number(goldPrevRows[0]?.count ?? 0);

  const goldChangePercent = percentChange(goldEarned, goldEarnedPrev);

  // ---- 4. Breakdown por Status ----
  const statusMap = new Map<string, number>();
  for (const g of userGamesInPeriod) {
    const key = g.status ?? "sem_status";
    statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
  }
  const statusBreakdown: DashboardBreakdownItem[] = Array.from(
    statusMap.entries()
  ).map(([key, value]) => {
    const label =
      key === "sem_status"
        ? "Sem status"
        : GAME_STATUS_LABELS[key as GameStatus] ?? key;
    const color = STATUS_COLORS[key as keyof typeof STATUS_COLORS] ?? MISSING_COLOR;
    return { label, value, color };
  });

  // ---- 5. Breakdown por Plataforma ----
  const userPlatforms = await db
    .select({ id: platforms.id, name: platforms.name, color: platforms.color })
    .from(platforms)
    .where(eq(platforms.userId, session.id));
  const platformById = new Map(userPlatforms.map((p) => [p.id, p]));

  const platformMap = new Map<string | null, number>();
  for (const g of userGamesInPeriod) {
    const key = g.platformId;
    platformMap.set(key, (platformMap.get(key) ?? 0) + 1);
  }
  const platformBreakdown: DashboardBreakdownItem[] = Array.from(
    platformMap.entries()
  ).map(([key, value]) => {
    if (key === null) {
      return { label: "Sem plataforma", value, color: MISSING_COLOR };
    }
    const p = platformById.get(key);
    return {
      label: p?.name ?? "Plataforma removida",
      value,
      color: p?.color ?? MISSING_COLOR,
    };
  });

  // ---- 6. Breakdown por Tags (many-to-many) ----
  // Pega as tags dos jogos adicionados no período + conta "Sem tags"
  const gameIdsInPeriod = userGamesInPeriod.map((g) => g.id);
  let tagRows: { tagId: string; tagName: string; tagColor: string; gameId: string }[] = [];
  if (gameIdsInPeriod.length > 0) {
    tagRows = await db
      .select({
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
        gameId: gameTags.gameId,
      })
      .from(gameTags)
      .innerJoin(tags, eq(gameTags.tagId, tags.id))
      .where(sql`${gameTags.gameId} IN ${gameIdsInPeriod}`);
  }

  const tagCounts = new Map<string, { name: string; color: string; count: number }>();
  const gamesWithTags = new Set<string>();
  for (const row of tagRows) {
    gamesWithTags.add(row.gameId);
    const existing = tagCounts.get(row.tagId);
    if (existing) {
      existing.count += 1;
    } else {
      tagCounts.set(row.tagId, {
        name: row.tagName,
        color: row.tagColor,
        count: 1,
      });
    }
  }

  const tagsBreakdown: DashboardBreakdownItem[] = Array.from(
    tagCounts.values()
  ).map((t) => ({ label: t.name, value: t.count, color: t.color }));

  const gamesWithoutTags = totalGamesAdded - gamesWithTags.size;
  if (gamesWithoutTags > 0) {
    tagsBreakdown.push({
      label: "Sem tags",
      value: gamesWithoutTags,
      color: MISSING_COLOR,
    });
  }

  // ---- 7. Distribuição de notas (meia-estrela) + Reviews ----
  // Buckets: 0.5, 1.0, ..., 5.0 + "Sem nota"
  const ratingBuckets = new Map<number, number>();
  for (let i = 1; i <= 10; i++) {
    ratingBuckets.set(i * 0.5, 0);
  }
  let semNota = 0;
  let reviewsCount = 0;

  for (const g of userGamesInPeriod) {
    const ratingNum = g.rating != null ? Number(g.rating) : null;
    if (ratingNum == null || Number.isNaN(ratingNum)) {
      semNota += 1;
    } else {
      // Arredonda pro meio mais próximo (0.5) por segurança
      const rounded = Math.round(ratingNum * 2) / 2;
      if (ratingBuckets.has(rounded)) {
        ratingBuckets.set(rounded, (ratingBuckets.get(rounded) ?? 0) + 1);
      }
    }
    if (g.review && g.review.trim().length > 0) {
      reviewsCount += 1;
    }
  }

  const ratingDistribution: DashboardRatingBucket[] = Array.from(
    ratingBuckets.entries()
  ).map(([rating, value]) => ({
    rating,
    label: rating.toFixed(1),
    value,
  }));
  ratingDistribution.push({
    rating: -1,
    label: "Sem nota",
    value: semNota,
  });

  const ratedCount = totalGamesAdded - semNota;

  // ---- 8. Timeline: jogos adicionados por bucket ----
  const buckets = buildTimelineBuckets(period, start);
  const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
  const values = new Array(buckets.length).fill(0);
  for (const g of userGamesInPeriod) {
    const key = bucketKeyForDate(period, g.createdAt);
    const idx = bucketIndex.get(key);
    if (idx !== undefined) values[idx] += 1;
  }
  const timeline: DashboardTimelinePoint[] = buckets.map((b, i) => ({
    label: b.label,
    value: values[i],
  }));

  return {
    period,
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      previousStart: previousStart.toISOString(),
      previousEnd: previousEnd.toISOString(),
    },
    totalGamesAdded,
    favoritesAdded,
    completionRate,
    completionRatePrev,
    goldEarned,
    goldEarnedPrev,
    goldChangePercent,
    statusBreakdown,
    platformBreakdown,
    tagsBreakdown,
    ratingDistribution,
    reviewsCount,
    ratedCount,
    timeline,
  };
}

/*
 * SUGESTÕES DE DADOS ADICIONAIS (para consideração futura):
 * - Tempo médio de conclusão: intervalo entre createdAt e updatedAt (quando status = "zerado")
 * - Rating médio dos jogos zerados no período
 * - Top 5 jogos com mais quests (tanto criadas quanto concluídas)
 * - Jogos abandonados no período (indicador de desistência)
 * - Heatmap de atividade: dias da semana com mais quests concluídas
 * - Streak de dias consecutivos com quests concluídas (gamificação)
 * - Distribuição de ratings (ex: quantos 5 estrelas, quantos 4, etc.)
 * - Platform com maior taxa de conclusão (qual plataforma você mais zera?)
 */
