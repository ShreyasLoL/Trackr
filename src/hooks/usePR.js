import { useContext } from 'react';
import { GymContext } from '../contexts/GymContext';
import { todayKey } from '../utils/dateHelpers';

export function detectPRs(exercises, existingPRs) {
  const updated = { ...existingPRs };
  const today = todayKey();

  exercises.forEach((exercise) => {
    const completedSets = exercise.sets.filter((s) => s.done);
    if (completedSets.length === 0) return;

    let bestSet = null;
    completedSets.forEach((set) => {
      if (!bestSet) {
        bestSet = set;
      } else if (set.weight > bestSet.weight) {
        bestSet = set;
      } else if (set.weight === bestSet.weight && set.reps > bestSet.reps) {
        bestSet = set;
      }
    });

    if (!bestSet) return;

    const existing = updated[exercise.name];
    if (!existing) {
      updated[exercise.name] = { weight: bestSet.weight, reps: bestSet.reps, date: today };
    } else if (bestSet.weight > existing.weight) {
      updated[exercise.name] = { weight: bestSet.weight, reps: bestSet.reps, date: today };
    } else if (bestSet.weight === existing.weight && bestSet.reps > existing.reps) {
      updated[exercise.name] = { weight: bestSet.weight, reps: bestSet.reps, date: today };
    }
  });

  return updated;
}

export function usePR() {
  const { prs } = useContext(GymContext);

  const isPR = (exerciseName, weight, reps) => {
    const existing = prs[exerciseName];
    if (!existing) return true;
    if (weight > existing.weight) return true;
    if (weight === existing.weight && reps > existing.reps) return true;
    return false;
  };

  const getPRDisplay = (exerciseName) => {
    const pr = prs[exerciseName];
    if (!pr) return null;
    return `${pr.weight}kg × ${pr.reps} reps`;
  };

  return { isPR, getPRDisplay };
}
