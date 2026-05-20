import { createContext, useContext, useCallback, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { todayKey } from "../utils/dateHelpers";

const initialState = {
  sessions: [],
  dailyLog: {},
};

export const CardioContext = createContext();

export function useCardio() {
  return useContext(CardioContext);
}

export function CardioProvider({ children }) {
  const [state, setState] = useLocalStorage("trackr_cardio", initialState);

  const addSession = useCallback(
    (sessionObject) => {
      setState((prev) => ({
        ...prev,
        sessions: [...prev.sessions, sessionObject],
      }));
    },
    [setState]
  );

  const logDaily = useCallback(
    (dateString, { steps, caloriesBurned }) => {
      setState((prev) => ({
        ...prev,
        dailyLog: {
          ...prev.dailyLog,
          [dateString]: {
            ...(prev.dailyLog[dateString] || {}),
            steps,
            caloriesBurned,
          },
        },
      }));
    },
    [setState]
  );

  const getSessionsForDate = useCallback(
    (dateString) => {
      return state.sessions.filter((s) => s.date === dateString);
    },
    [state.sessions]
  );

  const getLogForDate = useCallback(
    (dateString) => {
      return state.dailyLog[dateString] || { steps: 0, caloriesBurned: 0 };
    },
    [state.dailyLog]
  );

  const getTodayLog = useCallback(() => {
    return getLogForDate(todayKey());
  }, [getLogForDate]);

  const getRecentSessions = useCallback(
    (n) => {
      return [...state.sessions]
        .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
        .slice(0, n);
    },
    [state.sessions]
  );

  const value = useMemo(
    () => ({
      sessions: state.sessions,
      dailyLog: state.dailyLog,
      addSession,
      logDaily,
      getSessionsForDate,
      getLogForDate,
      getTodayLog,
      getRecentSessions,
    }),
    [
      state.sessions,
      state.dailyLog,
      addSession,
      logDaily,
      getSessionsForDate,
      getLogForDate,
      getTodayLog,
      getRecentSessions,
    ]
  );

  return (
    <CardioContext.Provider value={value}>{children}</CardioContext.Provider>
  );
}
