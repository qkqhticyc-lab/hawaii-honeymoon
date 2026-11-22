import { useEffect, useState, type FormEvent } from 'react';
import { expenseTotals, money, privateTravel, type Expense, type ExpenseInput } from './privateTravel';

const empty: ExpenseInput = { category: '', subcategory: '', vendor: '', direction: '지출', amount: null, currency: 'KRW', payer: '', payment_method: '', payment_date: '', status: '예정', memo: '', sort_order: 1000 };

export default function Expenses() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState<Expense | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('전체');
  const [search, setSearch] = useState('');
  const [deleted, setDeleted] = useState<Expense | null>(null);
  async function reload() {
    setLoading(true);
    setError('');
    const { data, error } = await privateTravel.from('travel_expenses').select('*').is('deleted_at', null).order('sort_order').order('id');
    if (error) setError('경비를 불러오지 못했습니다. 다시 시도해주세요.');
    else setRows(data as Expense[]);
    setLoading(false);
  }
  useEffect(() => { void reload(); }, []);
  async function save(input: ExpenseInput) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    const result = editing === 'new'
      ? await privateTravel.from('travel_expenses').insert(input).select().single()
      : await privateTravel.from('travel_expenses').update(input).eq('id', editing!.id).eq('revision', editing!.revision).is('deleted_at', null).select().single();
    if (result.error) setError('저장하지 못했습니다. 다른 기기에서 수정되었을 수 있습니다. 입력 내용은 유지되며, 최신 목록을 확인한 뒤 다시 수정할 수 있습니다.');
    else { setRows(prev => [...prev.filter(row => row.id !== result.data.id), result.data as Expense].sort((a, b) => a.sort_order - b.sort_order)); setEditing(null); setMessage('경비를 저장했습니다.'); }
    setBusy(false);
  }
  async function remove(row: Expense) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    const { data, error } = await privateTravel.from('travel_expenses').update({ deleted_at: new Date().toISOString() }).eq('id', row.id).eq('revision', row.revision).select().single();
    if (error) setError('삭제하지 못했습니다. 최신 목록을 확인해주세요.');
    else { setDeleted(data as Expense); setRows(prev => prev.filter(item => item.id !== row.id)); setMessage('경비를 삭제했습니다.'); }
    setBusy(false);
  }
  async function undoDelete() {
    if (!deleted || busy) return;
    setBusy(true);
    const { data, error } = await privateTravel.from('travel_expenses').update({ deleted_at: null }).eq('id', deleted.id).eq('revision', deleted.revision).select().single();
    if (error) setError('복구하지 못했습니다. 다시 시도해주세요.');
    else { setRows(prev => [...prev, data as Expense].sort((a, b) => a.sort_order - b.sort_order)); setDeleted(null); setMessage('삭제한 경비를 복구했습니다.'); }
    setBusy(false);
  }
  const totals = expenseTotals(rows);
  const visible = rows.filter(row => (filter === '전체' || row.status === filter) && `${row.category} ${row.subcategory} ${row.vendor} ${row.payer} ${row.memo}`.toLowerCase().includes(search.toLowerCase()));
  const payers = [...new Set(rows.filter(row => row.status === '결제 완료' && row.direction === '지출' && row.payer).map(row => row.payer))];
  return <div className="expenses">
    <div className="expense-summary">{(['KRW', 'USD'] as const).filter(currency => currency === 'KRW' || rows.some(row => row.currency === currency)).map(currency => <section className="paper-card" key={currency} aria-label={`${currency} 경비 합계`}>
      <span className="eyebrow">{currency}</span><h3>{money(totals[currency].paid + totals[currency].planned, currency)}</h3>
      <dl><div><dt>결제 완료</dt><dd>{money(totals[currency].paid, currency)}</dd></div><div><dt>예정 지출</dt><dd>{money(totals[currency].planned, currency)}</dd></div>{totals[currency].income > 0 && <div><dt>수입</dt><dd>{money(totals[currency].income, currency)}</dd></div>}</dl>
    </section>)}</div>
    {payers.length > 0 && <div className="payer-summary" aria-label="결제자별 지출">{payers.map(payer => <span key={payer}><strong>{payer}</strong> {(['KRW', 'USD'] as const).filter(currency => rows.some(row => row.payer === payer && row.currency === currency && row.status === '결제 완료' && row.direction === '지출')).map(currency => money(expenseTotals(rows.filter(row => row.payer === payer))[currency].paid, currency)).join(' / ')}</span>)}</div>}
    <p className="footnote">원본에 입력된 금액 기준이며 통화별로 합산합니다. 취소 항목은 합계에서 제외됩니다.</p>
    <div className="expense-toolbar"><div className="private-actions"><button className="primary-button" disabled={busy || !!editing || loading} onClick={() => { setEditing('new'); setMessage(''); }}>경비 추가</button><button className="secondary-button" disabled={busy || loading} onClick={() => void reload()}>새로고침</button></div><label>검색<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="항목·업체·결제자" /></label></div>
    <div className="filter-row">{['전체', '예정', '결제 완료', '취소'].map(status => <button key={status} aria-pressed={filter === status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}</button>)}</div>
    {error && <p className="notice" role="alert">{error}</p>}
    <div className="private-feedback" role="status">{message}{deleted && <button className="text-button" disabled={busy} onClick={() => void undoDelete()}>삭제 취소</button>}</div>
    {editing && <ExpenseForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? empty : editing} busy={busy} onSave={save} onCancel={() => { setEditing(null); setError(''); }} />}
    {loading ? <p role="status">경비를 불러오는 중입니다.</p> : <div className="expense-table-wrap"><table className="expense-table"><caption>여행 경비 {visible.length}건</caption><thead><tr>{['대분류', '소분류 / 업체', '금액', '결제자', '결제수단', '결제일자', '상태', '비고', '관리'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.map(row => <tr key={row.id}>
      <td data-label="대분류">{row.category || '—'}</td><td data-label="소분류 / 업체"><strong>{row.subcategory}</strong><small>{row.vendor}</small>{row.direction === '수입' && <small>수입</small>}</td><td data-label="금액" className="amount">{row.amount === null ? '미입력' : money(Number(row.amount), row.currency)}</td><td data-label="결제자">{row.payer || '—'}</td><td data-label="결제수단">{row.payment_method || '—'}</td><td data-label="결제일자">{row.payment_date || '—'}</td><td data-label="상태"><span className={`expense-status ${row.status === '결제 완료' ? 'paid' : ''}`}>{row.status}</span></td><td data-label="비고" className="expense-memo">{row.memo || '—'}</td><td data-label="관리"><div className="private-actions"><button className="text-button" disabled={busy || !!editing} onClick={() => { setEditing(row); setError(''); setMessage(''); }}>수정<span className="sr-only"> {row.subcategory}</span></button><button className="text-button" disabled={busy || !!editing} onClick={() => void remove(row)}>삭제<span className="sr-only"> {row.subcategory}</span></button></div></td>
    </tr>)}</tbody></table>{visible.length === 0 && <p className="empty-state">표시할 경비가 없습니다.</p>}</div>}
  </div>;
}

function ExpenseForm({ initial, busy, onSave, onCancel }: { initial: ExpenseInput; busy: boolean; onSave: (input: ExpenseInput) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const [amount, setAmount] = useState(initial.amount === null ? '' : String(initial.amount));
  const [error, setError] = useState('');
  const update = (key: keyof ExpenseInput, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = amount === '' ? null : Number(amount);
    if (!form.subcategory.trim() || (parsed !== null && (!Number.isFinite(parsed) || parsed < 0 || parsed > 9999999999999 || Math.abs(parsed * 100 - Math.round(parsed * 100)) > 0.001))) { setError('항목명과 금액을 확인해주세요. 금액은 0 이상, 소수점 둘째 자리까지 입력할 수 있습니다.'); return; }
    setError(''); void onSave({ ...form, subcategory: form.subcategory.trim(), amount: parsed });
  }
  return <form className="paper-card expense-form" onSubmit={submit}><h3>{'id' in initial ? '경비 수정' : '경비 추가'}</h3><fieldset disabled={busy}><legend className="sr-only">경비 입력</legend><div className="expense-form-grid">
    <label>대분류<input value={form.category} maxLength={100} onChange={e => update('category', e.target.value)} /></label>
    <label>소분류 / 항목명<input required value={form.subcategory} maxLength={200} onChange={e => update('subcategory', e.target.value)} /></label>
    <label>업체<input value={form.vendor} maxLength={200} onChange={e => update('vendor', e.target.value)} /></label>
    <label>지출 / 수입<select aria-label="지출 / 수입" value={form.direction} onChange={e => update('direction', e.target.value)}><option>지출</option><option>수입</option></select></label>
    <label>금액<input type="number" min="0" max="9999999999999" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></label>
    <label>통화<select aria-label="통화" value={form.currency} onChange={e => update('currency', e.target.value)}><option value="KRW">KRW · 원</option><option value="USD">USD · 달러</option></select></label>
    <label>결제자<input value={form.payer} maxLength={100} onChange={e => update('payer', e.target.value)} /></label>
    <label>결제수단<input value={form.payment_method} maxLength={200} onChange={e => update('payment_method', e.target.value)} /></label>
    <label>결제일자<input value={form.payment_date} maxLength={100} placeholder="2026-12-23 또는 미정" onChange={e => update('payment_date', e.target.value)} /></label>
    <label>상태<select aria-label="상태" value={form.status} onChange={e => update('status', e.target.value)}><option>예정</option><option>결제 완료</option><option>취소</option></select></label>
    <label className="full-width">비고<textarea value={form.memo} maxLength={5000} rows={3} onChange={e => update('memo', e.target.value)} /></label>
  </div>{error && <p role="alert">{error}</p>}<div className="private-actions"><button type="submit" className="primary-button">{busy ? '저장 중…' : '경비 저장'}</button><button type="button" className="secondary-button" onClick={onCancel}>수정 취소</button></div></fieldset></form>;
}
