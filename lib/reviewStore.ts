"use client";
import { useState, useEffect, useCallback } from "react";

export type ActivityEntry = { title: string; sub: string; time: string };
export type Review = {
  status: string;          // verified | correction | rejected | pending | review | approved
  reason?: string;
  note?: string;
  category?: string;
  by?: string;
  date?: string;
  activity: ActivityEntry[];
};

export function nowStamp() {
  // client-side timestamp for the action
  try {
    const d = new Date();
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "just now";
  }
}

/** localStorage-backed review records keyed by id (survives refresh) */
export function useReviews(storageKey: string) {
  const [map, setMap] = useState<Record<string, Review>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) setMap(JSON.parse(raw)); } catch {}
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (loaded) { try { localStorage.setItem(storageKey, JSON.stringify(map)); } catch {} }
  }, [map, loaded, storageKey]);

  const get = useCallback((id: string): Review | undefined => map[id], [map]);
  const set = useCallback((id: string, next: Review) => setMap((m) => ({ ...m, [id]: next })), []);
  const append = useCallback((id: string, patch: Partial<Review>, activity: ActivityEntry) =>
    setMap((m) => {
      const prev = m[id] || { status: "pending", activity: [] };
      return { ...m, [id]: { ...prev, ...patch, activity: [activity, ...(prev.activity || [])] } };
    }), []);

  return { map, get, set, append, loaded };
}
