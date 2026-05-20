export default function WorkoutRow({ workout, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-3 group">
      <input
        id={`workout-name-${index}`}
        type="text"
        placeholder="Workout name"
        value={workout.name}
        onChange={(e) => onChange(index, 'name', e.target.value)}
        className="flex-1 bg-cream border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted/60 focus:border-accent"
      />
      <input
        id={`workout-duration-${index}`}
        type="text"
        placeholder="Duration (e.g. 30 min)"
        value={workout.duration}
        onChange={(e) => onChange(index, 'duration', e.target.value)}
        className="w-40 bg-cream border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted/60 focus:border-accent"
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-lg font-light transition-opacity cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
        aria-label="Remove workout"
      >
        ×
      </button>
    </div>
  );
}
