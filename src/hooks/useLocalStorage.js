import { useState, useCallback, useRef, useEffect } from "react";

export function useLocalStorage(key, initialValue, { debounce = 400 } = {}) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const debounceRef = useRef(null);
  const valueRef = useRef(value);

  const persist = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(valueRef.current));
      } catch {}
    }, debounce);
  }, [key, debounce]);

  useEffect(() => {
    valueRef.current = value;
    persist();
    return () => clearTimeout(debounceRef.current);
  }, [value, persist]);

  return [value, setValue];
}
