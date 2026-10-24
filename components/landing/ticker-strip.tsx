function SunMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.2 3.6L17 6.8l-3.6 1.2L12 12l-1.2-3.6L7 6.8l3.8-1.2L12 2zm0 10l1.4 4.2L17.6 18l-4.2 1.4L12 22l-1.4-4.2L6.4 18l4.2-1.4L12 12z" />
    </svg>
  );
}

const segment = (
  <>
    <span className="mx-6 text-lg font-semibold tracking-wide">Washuply</span>
    <SunMark className="mx-2 shrink-0 opacity-90" />
  </>
);

export function TickerStrip() {
  return (
    <div className="overflow-hidden bg-brand-dark py-3.5 text-white">
      <div className="flex w-max animate-marquee items-center whitespace-nowrap">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="flex items-center">
            {segment}
          </span>
        ))}
      </div>
    </div>
  );
}
