export default function StatCard({ label, value, unit, delta, deltaPositive }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {delta && (
        <p
          className={`mt-1 text-xs ${
            deltaPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
