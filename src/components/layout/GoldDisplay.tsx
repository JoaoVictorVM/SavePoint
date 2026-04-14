"use client";

import { useEffect, useRef, useState } from "react";

interface GoldDisplayProps {
  amount: number;
  animate?: boolean;
}

function formatGold(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function GoldDisplay({ amount, animate = false }: GoldDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const prevAmount = useRef(amount);

  useEffect(() => {
    if (!animate || prevAmount.current === amount) {
      setDisplayAmount(amount);
      prevAmount.current = amount;
      return;
    }

    const start = prevAmount.current;
    const diff = amount - start;
    const duration = 800;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAmount(start + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
    prevAmount.current = amount;
  }, [amount, animate]);

  return (
    <div
      className="flex items-center gap-2 bg-[var(--color-accent-dark)] px-3 py-1.5 rounded-full"
      aria-live="polite"
    >
      <svg
        className="w-4 h-4 text-[var(--color-accent)]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <circle cx="10" cy="10" r="8" />
      </svg>
      <span className="text-sm font-bold font-mono text-[var(--color-accent)]">
        {formatGold(displayAmount)}
      </span>
    </div>
  );
}
