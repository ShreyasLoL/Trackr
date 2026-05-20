import { useState, useContext, useEffect, useCallback } from 'react';
import { GymContext } from '../contexts/GymContext';
import { todayKey } from '../utils/dateHelpers';

export function useWorkout() {
  const { saveWorkout } = useContext(GymContext);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!activeWorkout) {
      setElapsedMinutes(0);
      return;
    }

    const update = () => {
      const diff = Date.now() - activeWorkout.startTime;
      setElapsedMinutes(Math.floor(diff / 60000));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  const isActive = activeWorkout !== null;

  const startWorkout = useCallback((templateName, exerciseNames) => {
    setActiveWorkout({
      name: templateName,
      exercises: exerciseNames.map((name) => ({ name, sets: [] })),
      startTime: Date.now(),
    });
  }, []);

  const addExercise = useCallback((exerciseName) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: [...prev.exercises, { name: exerciseName, sets: [] }],
      };
    });
  }, []);

  const addSet = useCallback((exerciseIndex, { reps, weight }) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: [...ex.sets, { reps, weight, done: false }],
        };
      });
      return { ...prev, exercises };
    });
  }, []);

  const updateSet = useCallback((exerciseIndex, setIndex, updates) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, j) => {
          if (j !== setIndex) return s;
          return { ...s, ...updates };
        });
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  }, []);

  const toggleSetDone = useCallback((exerciseIndex, setIndex) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, i) => {
        if (i !== exerciseIndex) return ex;
        const sets = ex.sets.map((s, j) => {
          if (j !== setIndex) return s;
          return { ...s, done: !s.done };
        });
        return { ...ex, sets };
      });
      return { ...prev, exercises };
    });
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return null;

    const durationMinutes = Math.floor(
      (Date.now() - activeWorkout.startTime) / 60000
    );

    const completed = {
      id: Date.now().toString(),
      date: todayKey(),
      name: activeWorkout.name,
      exercises: activeWorkout.exercises,
      durationMinutes,
    };

    saveWorkout(completed);
    setActiveWorkout(null);
    return completed;
  }, [activeWorkout, saveWorkout]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  return {
    activeWorkout,
    isActive,
    startWorkout,
    addExercise,
    addSet,
    updateSet,
    toggleSetDone,
    finishWorkout,
    cancelWorkout,
    elapsedMinutes,
  };
}
