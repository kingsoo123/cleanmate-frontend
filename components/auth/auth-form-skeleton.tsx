export function AuthFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-10 rounded-full bg-secondary-surface" />
      <div className="h-8 w-3/4 rounded-lg bg-secondary-surface" />
      <div className="h-4 w-full rounded bg-secondary-surface" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 rounded-xl bg-secondary-surface" />
        ))}
        <div className="h-11 rounded-full bg-secondary-surface" />
      </div>
    </div>
  );
}
