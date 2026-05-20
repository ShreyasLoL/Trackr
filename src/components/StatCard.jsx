export default function StatCard({ label, value, unit }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col gap-1 min-w-0">
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-text tabular-nums">
          {value ?? '—'}
        </span>
        {unit && (
          <span className="text-sm text-text-muted font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}
