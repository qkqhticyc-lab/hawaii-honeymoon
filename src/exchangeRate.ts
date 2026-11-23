import { useEffect, useState } from 'react';

export const FX_URL = 'https://open.er-api.com/v6/latest/USD';
export const FX_STORAGE_KEY = 'hawaii-honeymoon.usdkrw.v1';
export type UsdKrwRate = { value: number; updatedAt: number; nextUpdateAt: number; retrievedAt: number };

function validRate(rate: Partial<UsdKrwRate>): rate is UsdKrwRate {
  return typeof rate.value === 'number' && Number.isFinite(rate.value) && rate.value > 0
    && typeof rate.updatedAt === 'number' && Number.isFinite(rate.updatedAt) && rate.updatedAt > 0
    && typeof rate.nextUpdateAt === 'number' && Number.isFinite(rate.nextUpdateAt) && rate.nextUpdateAt > rate.updatedAt
    && typeof rate.retrievedAt === 'number' && Number.isFinite(rate.retrievedAt) && rate.retrievedAt > 0;
}
export function parseUsdKrwRate(payload: unknown, now = Date.now()): UsdKrwRate {
  const data = payload as { result?: string; base_code?: string; rates?: { KRW?: number }; time_last_update_unix?: number; time_next_update_unix?: number } | null;
  const rate = { value: data?.rates?.KRW, updatedAt: Number(data?.time_last_update_unix) * 1000, nextUpdateAt: Number(data?.time_next_update_unix) * 1000, retrievedAt: now };
  if (data?.result !== 'success' || data.base_code !== 'USD' || !validRate(rate)) throw new Error('Invalid USD/KRW rate');
  return rate;
}
function cachedRate(): UsdKrwRate | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FX_STORAGE_KEY) || 'null');
    return value && typeof value === 'object' && validRate(value) ? value : null;
  } catch { return null; }
}
export function krwEquivalent(krw: number, usd: number, rate: UsdKrwRate | null) {
  if (usd !== 0 && !rate) return null;
  return Math.round(krw + usd * (rate?.value || 0));
}
export function useUsdKrwRate() {
  const [rate, setRate] = useState<UsdKrwRate | null>(cachedRate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let busy = false;
    let lastAttempt = 0;
    async function refresh(force = false) {
      if (busy || (!force && Date.now() - lastAttempt < 3600000)) return;
      const cached = cachedRate();
      if (!force && cached && cached.nextUpdateAt > Date.now()) { setRate(cached); return; }
      busy = true; lastAttempt = Date.now(); setLoading(true);
      try {
        const response = await fetch(FX_URL, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('Rate request failed');
        const next = parseUsdKrwRate(await response.json());
        if (!active) return;
        setRate(next); setError(false);
        try { localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(next)); } catch { /* The fetched rate also works without persistent storage. */ }
      } catch { if (active) setError(true); }
      finally { busy = false; if (active) setLoading(false); }
    }
    void refresh(attempt > 0);
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 3600000);
    const focus = () => { void refresh(); };
    window.addEventListener('focus', focus);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [attempt]);
  return { rate, loading, error, refresh: () => setAttempt(value => value + 1) };
}
