export default function SetRow({ setNumber, reps, weight, done, onRepsChange, onWeightChange, onToggleDone }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 w-6 text-center">{setNumber}</span>
      <input
        type="number"
        value={weight}
        onChange={(e) => onWeightChange(Number(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-20 text-center"
        placeholder="lbs"
        min={0}
      />
      <span className="text-sm text-gray-400">×</span>
      <input
        type="number"
        value={reps}
        onChange={(e) => onRepsChange(Number(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-16 text-center"
        placeholder="reps"
        min={0}
      />
      <button
        onClick={onToggleDone}
        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${
          done
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        ✓
      </button>
    </div>
  );
}
