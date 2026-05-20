import { useState, useCallback } from 'react';

const STORAGE_KEY = 'profile';

function readProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function useProfile() {
  const [profile, setProfile] = useState(() => readProfile());

  const saveProfile = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setProfile(data);
  }, []);

  const hasOnboarded = profile !== null;

  return { profile, saveProfile, hasOnboarded };
}
