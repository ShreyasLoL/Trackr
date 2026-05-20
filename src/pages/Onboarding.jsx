import { useState } from 'react';

export default function Onboarding({ onComplete }) {
  const [unit, setUnit] = useState('kg');
  const [goalWeight, setGoalWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const profile = {
      unit,
      ...(goalWeight ? { goalWeight: parseFloat(goalWeight) } : {}),
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Animated entrance */}
        <div
          className="bg-card rounded-2xl shadow-sm border border-border/50 p-8 space-y-6"
          style={{ animation: 'fadeUp 0.5s ease-out' }}
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-text tracking-tight">
              Welcome to Trackr
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Set up your preferences to get started tracking your health.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Unit selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-text-muted">
                Weight unit
              </label>
              <div className="flex gap-3">
                {['kg', 'lbs'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                      unit === u
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-cream border-border text-text-muted hover:border-accent/40 hover:text-text'
                    }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal weight */}
            <div className="space-y-2">
              <label
                htmlFor="goal-weight"
                className="block text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                Goal weight{' '}
                <span className="normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input
                id="goal-weight"
                type="number"
                step="0.1"
                min="0"
                placeholder={`e.g. ${unit === 'kg' ? '70' : '154'}`}
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                className="w-full bg-cream border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 focus:border-accent"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          All data is stored locally on your device.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
