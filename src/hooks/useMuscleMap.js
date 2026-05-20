import { useContext, useCallback } from 'react';
import { GymContext } from '../contexts/GymContext';
import { exerciseMap } from '../data/exerciseMap';
import { todayKey } from '../utils/dateHelpers';

export function useMuscleMap() {
  const { workouts } = useContext(GymContext);

  const getMusclesForDate = useCallback(
    (dateString) => {
      const muscles = new Set();
      workouts
        .filter((w) => w.date === dateString)
        .forEach((w) => {
          (w.exercises || []).forEach((ex) => {
            const groups = exerciseMap[ex.name] || [];
            groups.forEach((g) => muscles.add(g));
          });
        });
      return Array.from(muscles);
    },
    [workouts]
  );

  const getMusclesForRange = useCallback(
    (dateStrings) => {
      const counts = new Map();
      dateStrings.forEach((dateString) => {
        const dayWorkouts = workouts.filter((w) => w.date === dateString);
        dayWorkouts.forEach((w) => {
          const dayMuscles = new Set();
          (w.exercises || []).forEach((ex) => {
            const groups = exerciseMap[ex.name] || [];
            groups.forEach((g) => dayMuscles.add(g));
          });
          dayMuscles.forEach((m) => {
            counts.set(m, (counts.get(m) || 0) + 1);
          });
        });
      });
      return counts;
    },
    [workouts]
  );

  const getRecoveryStatus = useCallback(
    (muscleId) => {
      const today = todayKey();

      const makeKey = (offset) => {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const yesterday = makeKey(1);
      const dayBefore = makeKey(2);

      const hasMuscleOnDate = (dateString) => {
        return workouts
          .filter((w) => w.date === dateString)
          .some((w) =>
            (w.exercises || []).some((ex) => {
              const groups = exerciseMap[ex.name] || [];
              return groups.includes(muscleId);
            })
          );
      };

      if (hasMuscleOnDate(today)) return 'trained_today';
      if (hasMuscleOnDate(yesterday) || hasMuscleOnDate(dayBefore)) return 'recovering';
      return 'fresh';
    },
    [workouts]
  );

  return { getMusclesForDate, getMusclesForRange, getRecoveryStatus };
}
