export type Checks = Record<string, boolean>;
type ChecklistRow = { task_id: string; checked: boolean };
type ChecklistConfig = { url: string; publishableKey: string };

export function checklistChanges(saved: Checks, draft: Checks): Checks {
  return Object.fromEntries(Object.entries(draft).filter(([id, value]) => saved[id] !== value));
}

export function checklistRows(payload: unknown, expectedIds: string[]): Checks {
  if (!Array.isArray(payload)) throw new Error('Invalid shared checklist');
  const allowed = new Set(expectedIds);
  const values = new Map<string, boolean>();
  for (const item of payload as Partial<ChecklistRow>[]) {
    if (item && typeof item.task_id === 'string' && typeof item.checked === 'boolean' && allowed.has(item.task_id)) {
      values.set(item.task_id, item.checked);
    }
  }
  if (values.size !== allowed.size) throw new Error('Missing shared checklist items');
  return Object.fromEntries(values);
}

export function createSharedChecklist(config: ChecklistConfig, ids: string[]) {
  const base = new URL('/rest/v1/', config.url);
  async function request(path: string, init?: RequestInit) {
    const res = await fetch(new URL(path, base), {
      ...init,
      headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Checklist request failed: ${res.status}`);
    return checklistRows(await res.json(), ids);
  }
  return {
    read: () => request('trip_checklist?select=task_id,checked'),
    save: (changes: Checks) => request('rpc/save_trip_checklist', {
      method: 'POST',
      body: JSON.stringify({ changes: Object.entries(changes).map(([task_id, checked]) => ({ task_id, checked })) }),
    }),
  };
}
