"use client";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  function handleClick(starIndex: number, isLeftHalf: boolean) {
    if (!onChange) return;
    const newValue = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(newValue === value ? 0 : newValue);
  }

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const filled = value - starIndex;
        const isFull = filled >= 1;
        const isHalf = !isFull && filled >= 0.5;

        return (
          <div key={starIndex} className={`relative ${starSize} ${onChange ? "cursor-pointer" : ""}`}>
            {/* Background (empty star) */}
            <svg className={`${starSize} text-[var(--color-bg-elevated)]`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>

            {/* Filled overlay */}
            {(isFull || isHalf) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: isFull ? "100%" : "50%" }}
              >
                <svg className={`${starSize} text-[var(--color-gold)]`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
            )}

            {onChange && (
              <>
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  onClick={() => handleClick(starIndex, true)}
                  aria-label={`${starIndex + 0.5} estrelas`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  onClick={() => handleClick(starIndex, false)}
                  aria-label={`${starIndex + 1} estrelas`}
                />
              </>
            )}
          </div>
        );
      })}
      {value > 0 && (
        <span className="ml-1.5 text-sm text-[var(--color-text-muted)]">{value}</span>
      )}
    </div>
  );
}
