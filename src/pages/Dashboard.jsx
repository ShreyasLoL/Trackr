import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import WorkoutRow from '../components/WorkoutRow';

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function Dashboard({ profile, getLog, saveLog }) {
  const today = todayKey();
  const existing = getLog(today);

  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [workouts, setWorkouts] = useState([{ name: '', duration: '' }]);
  const [saved, setSaved] = useState(false);

  // Pre-fill form with today's existing log
  useEffect(() => {
    if (existing) {
      setWeight(existing.weight ?? '');
      setCalories(existing.calories ?? '');
      setSteps(existing.steps ?? '');
      setWorkouts(
        existing.workouts?.length
          ? existing.workouts
          : [{ name: '', duration: '' }]
      );
    }
  }, []);

  const handleWorkoutChange = (index, field, value) => {
    setWorkouts((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    );
  };

  const addWorkoutRow = () => {
    setWorkouts((prev) => [...prev, { name: '', duration: '' }]);
  };

  const removeWorkoutRow = (index) => {
    setWorkouts((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      weight: weight !== '' ? parseFloat(weight) : null,
      calories: calories !== '' ? parseInt(calories, 10) : null,
      steps: steps !== '' ? parseInt(steps, 10) : null,
      workouts: workouts.filter((w) => w.name.trim() !== ''),
    };
    saveLog(today, data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filledWorkouts = existing?.workouts?.filter((w) => w.name.trim()) || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-text tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Weight"
          value={existing?.weight}
          unit={profile?.unit}
        />
        <StatCard label="Calories" value={existing?.calories} unit="kcal" />
        <StatCard label="Steps" value={existing?.steps?.toLocaleString()} />
        <StatCard label="Workouts" value={filledWorkouts.length} />
      </div>

      {/* Log form */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 lg:p-8">
        <h2 className="text-base font-semibold text-text mb-6">
          Today&apos;s Log
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Metric inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="log-weight"
                className="block text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                Weight ({profile?.unit})
              </label>
              <input
                id="log-weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="log-calories"
                className="block text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                Calories (kcal)
              </label>
              <input
                id="log-calories"
                type="number"
                min="0"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="log-steps"
                className="block text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                Steps
              </label>
              <input
                id="log-steps"
                type="number"
                min="0"
                placeholder="0"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-accent"
              />
            </div>
          </div>

          {/* Workouts */}
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-text-muted">
              Workouts
            </label>
            <div className="space-y-2">
              {workouts.map((w, i) => (
                <WorkoutRow
                  key={i}
                  workout={w}
                  index={i}
                  onChange={handleWorkoutChange}
                  onRemove={removeWorkoutRow}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addWorkoutRow}
              className="text-sm text-accent hover:text-accent-hover font-medium cursor-pointer transition-colors"
            >
              + Add workout
            </button>
          </div>

          {/* Save */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Log
            </button>
            {saved && (
              <span className="text-sm text-accent font-medium animate-pulse">
                ✓ Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
