import { days, places, stays, tasks, type PlaceId, type Route } from './data/trip';

export const STORAGE_KEY = 'hawaii-honeymoon.checklist.v1';
export type View = 'daily' | 'overview' | 'bookings' | 'prepare';
export const views: { id: View; name: string; label: string }[] = [
  { id: 'overview', name: '여행 전체', label: '01' }, { id: 'daily', name: '날짜별 일정', label: '02' },
  { id: 'bookings', name: '숙소·항공', label: '03' }, { id: 'prepare', name: '준비할 일', label: '04' },
];
// Parse date-only values explicitly in UTC, never in the viewer's local zone.
export function dateLabel(date: string, full = false) {
  return new Intl.DateTimeFormat('ko-KR', { month: full ? 'long' : 'numeric', day: 'numeric', weekday: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}
export function weekday(date: string) { return new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)); }
export function todayInHawaii(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Honolulu', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function defaultDate(now = new Date()) { const today = todayInHawaii(now); return days.some(d => d.date === today) ? today : days[0].date; }
export function readLocation(hash: string, now = new Date()): { date: string; view: View } {
  const p = new URLSearchParams(hash.replace(/^#/, ''));
  return { date: days.some(d => d.date === p.get('date')) ? p.get('date')! : defaultDate(now), view: views.some(v => v.id === p.get('view')) ? p.get('view') as View : 'daily' };
}
export function locationHash(date: string, view: View) { return `#view=${view}&date=${date}`; }
export function nightStay(date: string) { return stays.find(s => s.checkIn <= date && date < s.checkOut); }
export function flightLocal(iso: string, zone: string) {
  const time = new Intl.DateTimeFormat('ko-KR', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
  const date = new Intl.DateTimeFormat('ko-KR', { timeZone: zone, month: 'numeric', day: 'numeric' }).format(new Date(iso));
  return { time, date, zone: zone === 'Asia/Seoul' ? '한국시간' : '하와이시간' };
}
export function mapUrl(id: PlaceId) { const place = places[id] as { query?: string }; return place.query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query)}` : undefined; }
export function directionUrl(route: Route) {
  if (!['도보', '차량', '한인택시'].includes(route.mode) || route.stops.length < 2 || route.stops.length > 5) return undefined;
  const queries = route.stops.map(id => (places[id] as { query?: string }).query);
  if (queries.some(q => !q)) return undefined;
  const p = new URLSearchParams({ api: '1', origin: queries[0]!, destination: queries.at(-1)!, travelmode: route.mode === '도보' ? 'walking' : 'driving' });
  if (queries.length > 2) p.set('waypoints', queries.slice(1, -1).join('|'));
  return `https://www.google.com/maps/dir/?${p}`;
}
export function loadChecklist(raw: string | null) {
  const defaults = Object.fromEntries(tasks.map(t => [t.id, t.done]));
  if (!raw) return defaults;
  try { const parsed: unknown = JSON.parse(raw); if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return defaults;
    for (const task of tasks) { const val = (parsed as Record<string, unknown>)[task.id]; if (typeof val === 'boolean') defaults[task.id] = val; }
  } catch { /* Recover from corrupt or outdated browser storage. */ }
  return defaults;
}
