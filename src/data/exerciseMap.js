export const exerciseMap = {
  // Chest
  "Bench press":         ["chest", "front-deltoid", "triceps"],
  "Incline bench press": ["chest", "front-deltoid", "triceps"],
  "Decline bench press": ["chest", "triceps"],
  "Dumbbell fly":        ["chest"],
  "Cable fly":           ["chest"],
  "Push-up":             ["chest", "front-deltoid", "triceps"],

  // Back
  "Deadlift":            ["lats", "traps", "lower-back", "glutes", "hamstrings"],
  "Pull-up":             ["lats", "biceps", "rear-deltoid"],
  "Barbell row":         ["lats", "traps", "rear-deltoid", "biceps"],
  "Cable row":           ["lats", "traps", "rear-deltoid"],
  "Lat pulldown":        ["lats", "biceps"],
  "Face pull":           ["rear-deltoid", "traps"],

  // Shoulders
  "Overhead press":      ["front-deltoid", "triceps", "traps"],
  "Lateral raise":       ["front-deltoid", "rear-deltoid"],
  "Front raise":         ["front-deltoid"],
  "Rear delt fly":       ["rear-deltoid"],

  // Legs
  "Squat":               ["quads", "glutes", "hamstrings"],
  "Leg press":           ["quads", "glutes"],
  "Romanian deadlift":   ["hamstrings", "glutes", "lower-back"],
  "Leg curl":            ["hamstrings"],
  "Leg extension":       ["quads"],
  "Calf raise":          ["calves"],
  "Lunges":              ["quads", "glutes", "hamstrings"],

  // Arms
  "Barbell curl":        ["biceps"],
  "Dumbbell curl":       ["biceps"],
  "Hammer curl":         ["biceps", "forearms"],
  "Tricep pushdown":     ["triceps"],
  "Skull crusher":       ["triceps"],
  "Dips":                ["triceps", "chest", "front-deltoid"],
  "Wrist curl":          ["forearms"],

  // Core
  "Plank":               ["abs"],
  "Crunch":              ["abs"],
  "Leg raise":           ["abs"],
  "Cable crunch":        ["abs"],
  "Russian twist":       ["abs"],
};

export function getMusclesFromExercises(exerciseNames) {
  const muscles = new Set();
  exerciseNames.forEach((name) => {
    const groups = exerciseMap[name] || [];
    groups.forEach((g) => muscles.add(g));
  });
  return Array.from(muscles);
}
