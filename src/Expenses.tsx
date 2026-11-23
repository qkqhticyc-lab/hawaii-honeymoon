import { useEffect, useRef, useState } from 'react';
import { expenseTotals, money, privateTravel, type Expense, type ExpenseInput } from './privateTravel';
import { krwEquivalent, useUsdKrwRate, type UsdKrwRate } from './exchangeRate';
import { useExpenseAutosave } from './useExpenseAutosave';
import ExpenseGridRow from './ExpenseGridRow';

function ExpenseAmount({ amount, currency, rate }: { amount: number; currency: 'KRW' | 'USD'; rate: UsdKrwRate | null }) {
  return <>{money(amount, currency)}{currency === 'USD' && <small className="converted-amount"> ({rate ? `약 ${money(Math.round(amount * rate.value), 'KRW')}` : '환율 확인 필요'})</small>}</>;
}

const empty: ExpenseInput = { category: '', subcategory: '', vendor: '', direction: '지출', amount: null, currency: 'KRW', payer: '', payment_method: '', payment_date: '', status: '예정', memo: '', sort_order: 1000 };

export default function Expenses() {
  const fx = useUsdKrwRate();
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');
  const [deleted, setDeleted] = useState<Expense | null>(null);
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<string | null>(null);
  const loadVersion = useRef(0);
  const newId = useRef<string | null>(null);
  const grid = useExpenseAutosave(rows, setRows);
  const displayRows = grid.displayRows;
  const payerOptions = [...new Set(displayRows.map(row => row.payer).filter(Boolean))];
  const issueCount = Object.values(grid.states).filter(state => ['error', 'conflict', 'invalid'].includes(state.status)).length;
  async function reload() {
    const version = ++loadVersion.current;
    setLoading(true); setError('');
    const { data, error } = await privateTravel.from('travel_expenses').select('*').is('deleted_at', null).order('sort_order').order('id');
    if (version !== loadVersion.current) return;
    if (error) setError('경비를 불러오지 못했습니다. 다시 시도해주세요.');
    else { setRows(data as Expense[]); grid.reset(); }
    setLoading(false);
  }
  useEffect(() => { void reload(); return () => { loadVersion.current++; }; }, []);
  async function add() {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    newId.current ||= crypto.randomUUID();
    let result = await privateTravel.from('travel_expenses').insert({ ...empty, id: newId.current, subcategory: '새 경비', sort_order: Math.max(0, ...rows.map(row => row.sort_order)) + 1 }).select().single();
    if (result.error?.code === '23505') result = await privateTravel.from('travel_expenses').select('*').eq('id', newId.current).single();
    if (result.error) setError('행을 추가하지 못했습니다. 다시 시도해주세요.');
    else {
      const row = result.data as Expense;
      setRows(previous => [...previous.filter(item => item.id !== row.id), row]);
      setFilter('전체'); setSearch(''); setNewRow(row.id); newId.current = null;
      setMessage('새 행을 추가했습니다. 셀에서 바로 입력해주세요.');
    }
    setBusy(false);
  }
  async function remove(id: string) {
    if (busy || grid.states[id]?.status === 'saving') return;
    const row = rows.find(item => item.id === id);
    if (!row) return;
    grid.reset(id); setBusy(true); setError(''); setMessage('');
    const { data, error } = await privateTravel.from('travel_expenses').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('revision', row.revision).select().single();
    if (error) setError('삭제하지 못했습니다. 최신 목록을 확인해주세요.');
    else { setDeleted(data as Expense); setRows(previous => previous.filter(item => item.id !== id)); setMessage('경비를 삭제했습니다.'); }
    setBusy(false);
  }
  async function undoDelete() {
    if (!deleted || busy) return;
    setBusy(true);
    const { data, error } = await privateTravel.from('travel_expenses').update({ deleted_at: null }).eq('id', deleted.id).eq('revision', deleted.revision).select().single();
    if (error) setError('복구하지 못했습니다. 다시 시도해주세요.');
    else { setRows(previous => [...previous, data as Expense].sort((a, b) => a.sort_order - b.sort_order)); setDeleted(null); setMessage('삭제한 경비를 복구했습니다.'); }
    setBusy(false);
  }
  const totals = expenseTotals(displayRows);
  const hasUsd = displayRows.some(row => row.currency === 'USD' && row.status !== '취소');
  const budget = krwEquivalent(totals.KRW.paid + totals.KRW.planned, totals.USD.paid + totals.USD.planned, fx.rate);
  const visible = displayRows.filter(row => row.id === focusedRow || (filter === '전체' || row.status === filter) && `${row.category} ${row.subcategory} ${row.vendor} ${row.payer} ${row.memo}`.toLowerCase().includes(search.toLowerCase()));
  const payers = [...new Set(displayRows.filter(row => row.status === '결제 완료' && row.direction === '지출' && row.payer).map(row => row.payer))];
  return <div className="expenses">
    <div className="expense-summary">{hasUsd && <section className="paper-card total-budget" aria-label="전체 경비 원화 환산"><span className="eyebrow">총 예상 경비 · 원화 환산</span><h3>{budget === null ? '환율 확인 필요' : `약 ${money(budget, 'KRW')}`}</h3><p>원화 금액과 달러의 참고 환산액을 합산합니다.</p></section>}{(['KRW', 'USD'] as const).filter(currency => currency === 'KRW' || displayRows.some(row => row.currency === currency)).map(currency => <section className="paper-card" key={currency} aria-label={`${currency} 경비 합계`}>
      <span className="eyebrow">{currency}</span><h3><ExpenseAmount amount={totals[currency].paid + totals[currency].planned} currency={currency} rate={fx.rate} /></h3>
      <dl><div><dt>결제 완료</dt><dd><ExpenseAmount amount={totals[currency].paid} currency={currency} rate={fx.rate} /></dd></div><div><dt>예정 지출</dt><dd><ExpenseAmount amount={totals[currency].planned} currency={currency} rate={fx.rate} /></dd></div>{totals[currency].income > 0 && <div><dt>수입</dt><dd><ExpenseAmount amount={totals[currency].income} currency={currency} rate={fx.rate} /></dd></div>}</dl>
    </section>)}</div>
    {payers.length > 0 && <div className="payer-summary" aria-label="결제자별 지출">{payers.map(payer => <span key={payer}><strong>{payer}</strong> {(['KRW', 'USD'] as const).filter(currency => displayRows.some(row => row.payer === payer && row.currency === currency && row.status === '결제 완료' && row.direction === '지출')).map(currency => <span className="payer-amount" key={currency}><ExpenseAmount amount={expenseTotals(displayRows.filter(row => row.payer === payer))[currency].paid} currency={currency} rate={fx.rate} /></span>)}</span>)}</div>}
    <div className="exchange-rate-info" aria-label="달러 원화 환율"><p>{fx.rate ? <>1 USD = {fx.rate.value.toLocaleString('ko-KR', {maximumFractionDigits: 2})}원 · {new Intl.DateTimeFormat('ko-KR', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).format(new Date(fx.rate.updatedAt))} 한국시간 기준{fx.rate.nextUpdateAt <= Date.now() && ' · 최근 저장 환율'}</> : fx.loading ? '환율을 불러오는 중입니다.' : '환율 확인이 필요합니다.'}</p><div><a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates By Exchange Rate API ↗</a><button className="text-button" disabled={fx.loading} onClick={fx.refresh}>{fx.loading ? '환율 확인 중…' : '환율 새로고침'}</button></div>{fx.error && <p role="status">환율을 갱신하지 못했습니다.{fx.rate ? ' 표시된 기준 시각의 환율로 계산합니다.' : ' 다시 시도해주세요.'}</p>}<p>일일 기준환율로 계산한 참고 금액입니다. 취소 항목은 합계에서 제외됩니다.</p></div>
    <div className="expense-toolbar"><div className="private-actions"><button className="primary-button" disabled={busy || loading} onClick={() => void add()}>경비 추가</button><button className="secondary-button" disabled={busy || loading || grid.pendingCount > 0} onClick={() => void reload()}>새로고침</button></div><label>검색<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="항목·업체·결제자" /></label></div>
    <div className="filter-row">{['전체', '예정', '결제 완료', '취소'].map(status => <button key={status} aria-pressed={filter === status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}</button>)}</div>
    {error && <p className="notice" role="alert">{error}</p>}
    <div className="grid-savebar" role="status"><strong>{issueCount ? `저장 확인 필요 ${issueCount}행` : grid.savingCount ? `자동 저장 중 ${grid.savingCount}행…` : grid.pendingCount ? `저장 대기 ${grid.pendingCount}행` : '모든 변경 저장 완료'}</strong><span>셀에서 바로 수정 · 입력 후 자동 저장 · Enter로 저장 · Esc로 셀 변경 취소</span></div>
    <div className="private-feedback" role="status">{message}{deleted && <button className="text-button" disabled={busy} onClick={() => void undoDelete()}>삭제 취소</button>}</div>
    {loading ? <p role="status">경비를 불러오는 중입니다.</p> : <div className="expense-table-wrap"><table className="expense-table"><caption>여행 경비 {visible.length}건</caption><thead><tr>{['대분류', '소분류 / 업체', '금액', '결제자', '결제수단', '결제일자', '상태', '비고', '관리'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.map(row => <ExpenseGridRow key={row.id} row={row} draft={grid.drafts[row.id] || {}} state={grid.states[row.id]} rate={fx.rate} payers={payerOptions} focus={newRow === row.id} disabled={busy} change={(field, value, immediate) => grid.change(row.id, field, value, immediate)} flush={() => void grid.flush(row.id)} revert={field => grid.revert(row.id, field)} restore={() => void grid.restore(row.id)} remove={() => void remove(row.id)} setFocus={focused => setFocusedRow(previous => focused ? row.id : previous === row.id ? null : previous)} />)}</tbody></table>{visible.length === 0 && <p className="empty-state">표시할 경비가 없습니다.</p>}</div>}
  </div>;
}
