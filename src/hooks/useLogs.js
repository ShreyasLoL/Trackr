import { useState, useCallback } from 'react';

const STORAGE_KEY = 'logs';

function readAllLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function useLogs() {
  const [logs, setLogs] = useState(() => readAllLogs());

  const getLog = useCallback((date) => {
    return logs[date] || null;
  }, [logs]);

  const saveLog = useCallback((date, data) => {
    setLogs((prev) => {
      const updated = { ...prev, [date]: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getAllLogs = useCallback(() => {
    return logs;
  }, [logs]);

  return { getLog, saveLog, getAllLogs };
}
