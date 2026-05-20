const colorClasses = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export default function MacroBar({ label, current, target, unit, color }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const barColor = colorClasses[color] || 'bg-blue-500';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
