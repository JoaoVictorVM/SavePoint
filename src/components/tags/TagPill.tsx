"use client";

interface TagPillProps {
  tag: { name: string; color: string };
  size?: "sm" | "md";
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function TagPill({
  tag,
  size = "sm",
  selected = false,
  onClick,
  disabled = false,
}: TagPillProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={disabled ? undefined : onClick}
      disabled={disabled && onClick ? true : undefined}
      className={`
        inline-flex items-center gap-1.5
        rounded-full border
        uppercase tracking-wide
        transition-all duration-[150ms] ease
        ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}
        ${disabled ? "opacity-40 cursor-not-allowed" : onClick ? "cursor-pointer" : ""}
        ${selected ? "opacity-100" : onClick ? "opacity-60 hover:opacity-80" : "opacity-100"}
      `}
      style={{
        borderColor: tag.color,
        backgroundColor: `${tag.color}26`,
        color: tag.color,
      }}
      role={onClick ? "checkbox" : undefined}
      aria-checked={onClick ? selected : undefined}
    >
      <span
        className={`rounded-full ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"}`}
        style={{ backgroundColor: tag.color }}
      />
      {tag.name}
    </Component>
  );
}
