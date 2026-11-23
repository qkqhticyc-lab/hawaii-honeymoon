import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { privateTravel, type Expense, type ExpenseInput } from './privateTravel';
import { usePrivateAccess } from './PrivateAccess';

export type ExpenseField = Exclude<keyof ExpenseInput, 'sort_order'>;
export type ExpenseDraft = Partial<Record<ExpenseField, string>>;
export type RowSaveState = { status: 'saving' | 'saved' | 'pending' | 'error' | 'conflict' | 'invalid'; message?: string };
const fieldLimits: Partial<Record<ExpenseField, number>> = { category: 100, subcategory: 200, vendor: 200, payer: 100, payment_method: 200, payment_date: 100, memo: 5000 };
export function parseExpenseAmount(raw: string): number | null | undefined {
  const clean = raw.trim().replaceAll(',', '');
  if (clean === '') return null;
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(clean) || Number(clean) > 9999999999999) return undefined;
  return Number(clean);
}

export function expensePatch(row: Expense, draft: ExpenseDraft): { patch: Partial<ExpenseInput>; error?: string } {
  const patch: Record<string, string | number | null> = {};
  for (const field of Object.keys(draft) as ExpenseField[]) {
    const raw = draft[field]!;
    let value: string | number | null = raw;
    if (field === 'amount') {
      const amount = parseExpenseAmount(raw);
      if (amount === undefined) return { patch: {}, error: '금액은 0 이상, 소수점 둘째 자리까지 입력해주세요.' };
      value = amount;
    }
    if (field === 'subcategory') { value = raw.trim(); if (!value) return { patch: {}, error: '항목명을 입력해주세요.' }; }
    if (fieldLimits[field] && raw.length > fieldLimits[field]!) return { patch: {}, error: '입력 가능한 글자 수를 초과했습니다.' };
    if (field === 'currency' && !['KRW', 'USD'].includes(raw)) return { patch: {}, error: '통화를 선택해주세요.' };
    if (field === 'status' && !['예정', '결제 완료', '취소'].includes(raw)) return { patch: {}, error: '상태를 선택해주세요.' };
    if (field === 'direction' && !['지출', '수입'].includes(raw)) return { patch: {}, error: '지출 또는 수입을 선택해주세요.' };
    const saved = field === 'amount' && row.amount !== null ? Number(row.amount) : row[field];
    if (value !== saved) patch[field] = value;
  }
  return { patch: patch as Partial<ExpenseInput> };
}

export function useExpenseAutosave(rows: Expense[], setRows: Dispatch<SetStateAction<Expense[]>>) {
  const { registerUnsavedCheck } = usePrivateAccess();
  const [drafts, setDrafts] = useState<Record<string, ExpenseDraft>>({});
  const [states, setStates] = useState<Record<string, RowSaveState>>({});
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const draftsRef = useRef(drafts);
  const statesRef = useRef(states);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const saving = useRef(new Set<string>());
  const uncertain = useRef(new Set<string>());
  const active = useRef(true);

  function state(id: string, value: RowSaveState) {
    statesRef.current = { ...statesRef.current, [id]: value };
    if (active.current) setStates(statesRef.current);
  }
  function pending(id: string) {
    const row = rowsRef.current.find(item => item.id === id);
    return row ? expensePatch(row, draftsRef.current[id] || {}) : { patch: {} };
  }
  function schedule(id: string, delay: number) {
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => { timers.current.delete(id); void saveRow(id); }, delay));
  }
  async function saveRow(id: string) {
    clearTimeout(timers.current.get(id)); timers.current.delete(id);
    if (saving.current.has(id) || statesRef.current[id]?.status === 'conflict') return;
    let row = rowsRef.current.find(item => item.id === id);
    if (!row) return;
    let change = pending(id);
    if (change.error) { state(id, { status: 'invalid', message: change.error }); return; }
    if (Object.keys(change.patch).length === 0 && !uncertain.current.has(id)) { state(id, { status: 'saved' }); return; }
    saving.current.add(id); state(id, { status: 'saving' });
    try {
      if (uncertain.current.has(id)) {
        const latest = await privateTravel.from('travel_expenses').select('*').eq('id', id).is('deleted_at', null).abortSignal(AbortSignal.timeout(15000)).single();
        if (latest.error) { state(id, { status: 'error', message: '이전 저장 결과를 확인하지 못했습니다. 입력 내용을 유지하고 있습니다. 다시 저장해주세요.' }); return; }
        const server = latest.data as Expense;
        const remaining = expensePatch(server, draftsRef.current[id] || {});
        if (server.revision !== row.revision && Object.keys(remaining.patch).length) { state(id, { status: 'conflict', message: '서버 내용이 변경되었습니다. 입력 내용은 유지됩니다. 최신값을 불러온 뒤 다시 수정해주세요.' }); return; }
        rowsRef.current = rowsRef.current.map(item => item.id === id ? server : item);
        if (active.current) setRows(previous => previous.map(item => item.id === id ? server : item));
        row = server; change = remaining; uncertain.current.delete(id);
        if (change.error || !Object.keys(change.patch).length) { state(id, change.error ? { status: 'invalid', message: change.error } : { status: 'saved' }); return; }
      }
      const { data, error } = await privateTravel.from('travel_expenses').update(change.patch).eq('id', id).eq('revision', row.revision).is('deleted_at', null).select().abortSignal(AbortSignal.timeout(15000)).single();
      if (error) {
        if (error.code !== 'PGRST116') uncertain.current.add(id);
        state(id, { status: error.code === 'PGRST116' ? 'conflict' : 'error', message: error.code === 'PGRST116' ? '다른 기기에서 수정·삭제된 행입니다. 입력 내용은 유지됩니다. 최신값을 불러온 뒤 다시 수정해주세요.' : '자동 저장하지 못했습니다. 입력 내용은 유지됩니다. 다시 저장해주세요.' });
        return;
      }
      const saved = data as Expense;
      rowsRef.current = rowsRef.current.map(item => item.id === id ? saved : item);
      if (active.current) setRows(previous => previous.map(item => item.id === id ? saved : item));
      const next = pending(id);
      state(id, next.error ? { status: 'invalid', message: next.error } : { status: Object.keys(next.patch).length ? 'pending' : 'saved' });
      if (!next.error && Object.keys(next.patch).length) schedule(id, 0);
    } catch { uncertain.current.add(id); state(id, { status: 'error', message: '자동 저장하지 못했습니다. 입력 내용은 유지됩니다. 다시 저장해주세요.' }); }
    finally { saving.current.delete(id); }
  }
  function change(id: string, field: ExpenseField, value: string, immediate = false) {
    draftsRef.current = { ...draftsRef.current, [id]: { ...draftsRef.current[id], [field]: value } };
    setDrafts(draftsRef.current);
    if (statesRef.current[id]?.status === 'conflict') return;
    state(id, { status: saving.current.has(id) ? 'saving' : 'pending' });
    schedule(id, immediate ? 0 : 700);
  }
  function reset(id?: string) {
    if (id) {
      clearTimeout(timers.current.get(id)); timers.current.delete(id);
      const { [id]: discarded, ...rest } = draftsRef.current;
      draftsRef.current = rest; setDrafts(rest); state(id, { status: 'saved' });
      uncertain.current.delete(id);
    } else {
      timers.current.forEach(clearTimeout); timers.current.clear();
      draftsRef.current = {}; statesRef.current = {}; setDrafts({}); setStates({});
      uncertain.current.clear();
    }
  }
  function revert(id: string, field: ExpenseField) {
    const row = rowsRef.current.find(item => item.id === id);
    if (row) change(id, field, row[field] === null ? '' : String(row[field]), true);
  }
  async function restore(id: string) {
    const { data, error } = await privateTravel.from('travel_expenses').select('*').eq('id', id).is('deleted_at', null).single();
    if (error?.code === 'PGRST116') {
      reset(id);
      rowsRef.current = rowsRef.current.filter(row => row.id !== id);
      setRows(previous => previous.filter(row => row.id !== id));
      return;
    }
    if (error) { state(id, { status: 'conflict', message: '최신 행을 불러오지 못했습니다. 다른 기기에서 삭제되었을 수 있습니다. 입력 내용을 복사한 뒤 목록을 새로고침해주세요.' }); return; }
    rowsRef.current = rowsRef.current.map(row => row.id === id ? data as Expense : row);
    setRows(previous => previous.map(row => row.id === id ? data as Expense : row));
    reset(id);
  }
  useEffect(() => {
    active.current = true;
    const isDirty = () => saving.current.size > 0 || rowsRef.current.some(row => { const change = pending(row.id); return change.error || Object.keys(change.patch).length || uncertain.current.has(row.id); });
    const unregister = registerUnsavedCheck(isDirty);
    const warn = (event: BeforeUnloadEvent) => {
      if (isDirty()) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      active.current = false;
      unregister();
      window.removeEventListener('beforeunload', warn);
      timers.current.forEach(clearTimeout); timers.current.clear();
      rowsRef.current.forEach(row => { if (statesRef.current[row.id]?.status !== 'conflict') void saveRow(row.id); });
    };
  }, [registerUnsavedCheck]);
  const pendingCount = rows.filter(row => { const change = expensePatch(row, drafts[row.id] || {}); return change.error || Object.keys(change.patch).length || states[row.id]?.status === 'saving' || uncertain.current.has(row.id); }).length;
  const displayRows = rows.map(row => {
    const draft = drafts[row.id] || {};
    const { amount, ...text } = draft;
    const parsed = amount === undefined ? row.amount : parseExpenseAmount(amount);
    const parsedAmount = parsed === undefined ? row.amount : parsed;
    return { ...row, ...text, amount: parsedAmount } as Expense;
  });
  return { drafts, states, displayRows, pendingCount, savingCount: Object.values(states).filter(value => value.status === 'saving').length, change, flush: saveRow, reset, revert, restore };
}
