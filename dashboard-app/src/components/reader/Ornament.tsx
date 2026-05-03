export default function Ornament({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2 L13.5 8.5 L20 7 L15.5 12 L20 17 L13.5 15.5 L12 22 L10.5 15.5 L4 17 L8.5 12 L4 7 L10.5 8.5 Z" />
    </svg>
  );
}

export function OrnamentRow({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-[var(--reader-green)]/60 ${className}`}
    >
      <Ornament size={12} />
      {label && (
        <span className="reader-display text-sm tracking-wide text-[var(--reader-green)] font-medium">
          {label}
        </span>
      )}
      <Ornament size={12} />
    </div>
  );
}
