export default function ArabicText({
  text,
  size = "md",
  className = "",
}: {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}) {
  const sizeClass =
    size === "2xl" ? "text-4xl sm:text-5xl"
    : size === "xl" ? "text-3xl sm:text-4xl"
    : size === "lg" ? "text-2xl sm:text-3xl"
    : size === "md" ? "text-xl sm:text-2xl"
    : "text-lg sm:text-xl";
  return (
    <p
      dir="rtl"
      lang="ar"
      className={`reader-arabic ${sizeClass} ${className}`}
    >
      {text}
    </p>
  );
}
