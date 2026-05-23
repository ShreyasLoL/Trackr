import { createContext, useContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { todayKey, calculateAge } from "../utils/dateHelpers";
import { calculateBMR, calculateTDEEFromBMR, calculateTargetCalories } from "../utils/calculations";

const initialState = {
  name: "",
  birthday: "",
  height: { value: 0, unit: "cm" },
  weightUnit: "kg",
  goalWeight: null,
  calorieTarget: null,
  proteinTarget: null,
  carbTarget: null,
  fatTarget: null,
  stepTarget: 10000,
  weightLog: {},
  moodLog: {},
  onboarded: false,
  activityLevel: "moderate",
  goalMode: "fat_loss",
  autoCalories: true,
};

export const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [profile, setProfile] = useLocalStorage("trackr_prefs", initialState);

  const updateProfile = useCallback(
    (updates) => {
      setProfile((prev) => ({ ...prev, ...updates }));
    },
    [setProfile]
  );

  const logWeight = useCallback(
    (weightValue) => {
      setProfile((prev) => {
        const updated = {
          ...prev,
          weightLog: { ...prev.weightLog, [todayKey()]: weightValue },
        };

        // Auto-update calorie target if enabled
        if (prev.autoCalories && prev.birthday && prev.height?.value) {
          const age = calculateAge(prev.birthday);
          const bmr = calculateBMR(weightValue, prev.height.value, age);
          const tdee = calculateTDEEFromBMR(bmr, prev.activityLevel || 'moderate');
          const newTarget = calculateTargetCalories(tdee, prev.goalMode || 'fat_loss');
          updated.calorieTarget = newTarget;
        }

        return updated;
      });
    },
    [setProfile]
  );

  const getLatestWeight = useCallback(() => {
    const dates = Object.keys(profile.weightLog);
    if (dates.length === 0) return null;
    dates.sort();
    return profile.weightLog[dates[dates.length - 1]];
  }, [profile.weightLog]);

  const hasOnboarded = profile.onboarded;

  const calculatedTDEE = useMemo(() => {
    const dates = Object.keys(profile.weightLog);
    if (dates.length === 0 || !profile.birthday || !profile.height?.value) return null;
    dates.sort();
    const w = profile.weightLog[dates[dates.length - 1]];
    if (!w) return null;
    const age = calculateAge(profile.birthday);
    const bmr = calculateBMR(w, profile.height.value, age);
    return calculateTDEEFromBMR(bmr, profile.activityLevel || 'moderate');
  }, [profile]);

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      logWeight,
      getLatestWeight,
      hasOnboarded,
      calculatedTDEE,
    }),
    [profile, updateProfile, logWeight, getLatestWeight, hasOnboarded, calculatedTDEE]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
