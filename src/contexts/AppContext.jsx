import { createContext, useContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { todayKey } from "../utils/dateHelpers";

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
      setProfile((prev) => ({
        ...prev,
        weightLog: { ...prev.weightLog, [todayKey()]: weightValue },
      }));
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

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      logWeight,
      getLatestWeight,
      hasOnboarded,
    }),
    [profile, updateProfile, logWeight, getLatestWeight, hasOnboarded]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
