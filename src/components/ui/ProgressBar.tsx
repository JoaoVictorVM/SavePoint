"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "active";
}

const sizeMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max,
  showLabel = false,
  size = "sm",
  variant = "default",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={`flex-1 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden ${sizeMap[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progresso: ${percentage}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            variant === "active" ? "bg-[var(--color-accent)]" : "bg-[var(--color-accent)]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[var(--color-text-muted)] font-medium whitespace-nowrap">
          {percentage}%
        </span>
      )}
    </div>
  );
}
