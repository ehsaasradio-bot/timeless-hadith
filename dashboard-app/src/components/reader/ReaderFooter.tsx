export default function ReaderFooter() {
  return (
    <footer
      className="no-print mt-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--reader-green) 0%, #0a3d24 100%)",
      }}
    >
      {/* Mandala motifs */}
      <svg
        viewBox="0 0 100 100"
        width="160"
        height="160"
        aria-hidden="true"
        className="absolute -left-6 -bottom-12 text-white/[0.06]"
        fill="currentColor"
      >
        <g>
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx="6"
              ry="36"
              transform={`rotate(${i * 22.5} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="6" />
        </g>
      </svg>
      <svg
        viewBox="0 0 100 100"
        width="160"
        height="160"
        aria-hidden="true"
        className="absolute -right-6 -bottom-12 text-white/[0.06]"
        fill="currentColor"
      >
        <g>
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx="6"
              ry="36"
              transform={`rotate(${i * 22.5} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="6" />
        </g>
      </svg>

      <div className="relative max-w-3xl mx-auto px-6 py-8 text-center">
        <p className="reader-display italic text-white/95 text-base sm:text-lg leading-relaxed">
          &ldquo;The best of you are those who learn the Qur&rsquo;an and teach it.&rdquo;
          <span className="not-italic ml-2 text-white/70 text-sm">— Bukhari</span>
        </p>
      </div>
    </footer>
  );
}
