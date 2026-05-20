import { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { GymContext } from '../contexts/GymContext';
import { NutritionContext } from '../contexts/NutritionContext';
import { calculateStreak } from '../utils/dateHelpers';

export function useStreak() {
  const { profile } = useContext(AppContext);
  const { workouts } = useContext(GymContext);
  const { logs } = useContext(NutritionContext);

  const allDates = useMemo(() => {
    const dateSet = new Set();

    if (profile?.weightLog) {
      Object.keys(profile.weightLog).forEach((d) => dateSet.add(d));
    }

    if (workouts) {
      workouts.forEach((w) => {
        if (w.date) dateSet.add(w.date);
      });
    }

    if (logs) {
      Object.keys(logs).forEach((d) => dateSet.add(d));
    }

    return Array.from(dateSet);
  }, [profile, workouts, logs]);

  const streak = useMemo(() => calculateStreak(allDates), [allDates]);

  const longestStreak = useMemo(() => {
    if (allDates.length === 0) return 0;

    const sorted = [...allDates].sort();
    let maxStreak = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T00:00:00');
      const curr = new Date(sorted[i] + 'T00:00:00');
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        current++;
        if (current > maxStreak) maxStreak = current;
      } else if (diffDays > 1) {
        current = 1;
      }
    }

    return maxStreak;
  }, [allDates]);

  return { streak, longestStreak };
}
