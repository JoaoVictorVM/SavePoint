"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardBreakdownItem } from "@/actions/dashboard";

interface DonutChartProps {
  title: string;
  data: DashboardBreakdownItem[];
  emptyMessage?: string;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { color: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{ backgroundColor: inner.color }}
        />
        <span className="text-[var(--color-text-primary)] font-medium">
          {name}
        </span>
        <span className="text-[var(--color-text-muted)]">{value}</span>
      </div>
    </div>
  );
}

export function DonutChart({
  title,
  data,
  emptyMessage = "Sem dados no período",
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const hasData = total > 0;

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        {title}
      </h3>

      {hasData ? (
        <>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="var(--color-bg-surface)"
                  strokeWidth={2}
                >
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    paddingTop: "8px",
                  }}
                  formatter={(value, entry) => {
                    // Adiciona a contagem ao lado da label
                    const payload = entry.payload as unknown as { value: number };
                    return (
                      <span
                        style={{
                          color: "var(--color-text-primary)",
                          marginLeft: 4,
                        }}
                      >
                        {value}{" "}
                        <span style={{ color: "var(--color-text-muted)" }}>
                          ({payload.value})
                        </span>
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
