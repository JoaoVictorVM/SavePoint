"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardTimelinePoint } from "@/actions/dashboard";

interface TimelineChartProps {
  data: DashboardTimelinePoint[];
}

interface TooltipPayload {
  value: number;
  payload: { label: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { value, payload: inner } = payload[0];
  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs">
      <p className="text-[var(--color-text-muted)]">{inner.label}</p>
      <p className="text-[var(--color-text-primary)] font-semibold">
        {value} {value === 1 ? "jogo" : "jogos"}
      </p>
    </div>
  );
}

export function TimelineChart({ data }: TimelineChartProps) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        Jogos adicionados ao longo do período
      </h3>

      {hasData ? (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "var(--color-accent)", strokeWidth: 1, strokeOpacity: 0.3 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#timelineFill)"
                dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--color-accent)", strokeWidth: 2, stroke: "var(--color-bg-surface)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[240px] flex items-center justify-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Nenhum jogo adicionado no período
          </p>
        </div>
      )}
    </div>
  );
}
