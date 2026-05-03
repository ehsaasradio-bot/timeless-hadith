export default function TranslationText({
  text,
  narrator,
  size = "md",
  className = "",
}: {
  text: string;
  narrator?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "lg" ? "text-lg sm:text-xl"
    : size === "md" ? "text-base sm:text-lg"
    : "text-sm sm:text-base";
  return (
    <div className={`reader-display ${className}`}>
      {narrator && (
        <p className={`${sizeClass} text-black/65 dark:text-white/70 mb-2`}>
          <span className="font-medium">{narrator}</span> reported:
        </p>
      )}
      <p className={`${sizeClass} leading-relaxed text-[var(--reader-ink)] dark:text-white`}>
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}
