import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Expense } from './privateTravel';
import type { UsdKrwRate } from './exchangeRate';
import { money, paymentPlan, paymentPlans } from './privateTravel';
import type { ExpenseDraft, ExpenseField, RowSaveState } from './useExpenseAutosave';

type Props = {
  row: Expense; draft: ExpenseDraft; state?: RowSaveState; rate: UsdKrwRate | null; payers: string[]; focus: boolean; disabled: boolean;
  change: (field: ExpenseField, value: string, immediate?: boolean) => void;
  flush: () => void; revert: (field: ExpenseField) => void; restore: () => void; remove: () => void; setFocus: (focused: boolean) => void;
};
const statusLabels = { saving: '저장 중…', saved: '저장 완료', pending: '저장 대기', error: '저장 실패', conflict: '변경 충돌', invalid: '입력 확인' };

export default function ExpenseGridRow({ row, draft, state, rate, payers, focus, disabled, change, flush, revert, restore, remove, setFocus }: Props) {
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (focus) { nameInput.current?.focus(); nameInput.current?.select(); } }, [focus]);
  function keys(event: KeyboardEvent, field: ExpenseField) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); revert(field); }
    if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement && event.shiftKey)) { event.preventDefault(); flush(); (event.target as HTMLElement).blur(); }
  }
  const value = (field: ExpenseField) => draft[field] ?? (row[field] === null ? '' : String(row[field]));
  const input = (field: ExpenseField, label: string, limit: number) => <input aria-label={label} value={value(field)} maxLength={limit} disabled={disabled} onChange={event => change(field, event.target.value)} onBlur={flush} onKeyDown={event => keys(event, field)} />;
  return <tr data-expense-id={row.id} className={`editable-expense ${state?.status || ''}`} onFocus={() => setFocus(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocus(false); }}>
    <td data-label="대분류"><div className="expense-cell">{input('category', '대분류', 100)}</div></td>
    <td data-label="소분류 / 업체"><div className="expense-cell expense-description"><input ref={nameInput} aria-label="소분류 / 항목명" value={value('subcategory')} maxLength={200} disabled={disabled} onChange={event => change('subcategory', event.target.value)} onBlur={flush} onKeyDown={event => keys(event, 'subcategory')} />{input('vendor', '업체', 200)}<select aria-label="지출 / 수입" value={value('direction')} disabled={disabled} onChange={event => change('direction', event.target.value, true)}><option>지출</option><option>수입</option></select></div></td>
    <td data-label="금액" className="amount"><div className="expense-cell"><div className="amount-editor"><select aria-label="통화" value={value('currency')} disabled={disabled} onChange={event => change('currency', event.target.value, true)}><option>KRW</option><option>USD</option></select><input aria-label="금액" type="text" inputMode="decimal" value={value('amount')} disabled={disabled} placeholder="미입력" onChange={event => change('amount', event.target.value)} onBlur={flush} onKeyDown={event => keys(event, 'amount')} /></div>{row.currency === 'USD' && row.amount !== null && <small className="converted-amount">({rate ? `약 ${money(Math.round(row.amount * rate.value), 'KRW')}` : '환율 확인 필요'})</small>}</div></td>
    <td data-label="결제자"><div className="expense-cell"><PayerSelect value={value('payer')} options={payers} disabled={disabled} onChange={payer => change('payer', payer, true)} /></div></td>
    <td data-label="결제구분"><div className="expense-cell"><select aria-label="결제구분" className={`payment-plan ${paymentPlan(row) === '현지 현금' ? 'cash' : ''}`} value={draft.payment_plan ?? paymentPlan(row)} disabled={disabled} onChange={event => change('payment_plan', event.target.value, true)} onKeyDown={event => keys(event, 'payment_plan')}>{paymentPlans.map(plan => <option key={plan}>{plan}</option>)}</select></div></td>
    <td data-label="결제수단"><div className="expense-cell">{input('payment_method', '결제수단', 200)}</div></td>
    <td data-label="결제일자"><div className="expense-cell">{input('payment_date', '결제일자', 100)}</div></td>
    <td data-label="상태"><div className="expense-cell"><select aria-label="상태" value={value('status')} className={`status-select ${row.status === '결제 완료' ? 'paid' : ''}`} disabled={disabled} onChange={event => change('status', event.target.value, true)}><option>예정</option><option>결제 완료</option><option>취소</option></select></div></td>
    <td data-label="비고" className="expense-memo"><div className="expense-cell"><textarea aria-label="비고" value={value('memo')} rows={2} maxLength={5000} disabled={disabled} onChange={event => change('memo', event.target.value)} onBlur={flush} onKeyDown={event => keys(event, 'memo')} /></div></td>
    <td data-label="관리"><div className="expense-cell row-save-controls"><span className={`row-save-state ${state?.status || ''}`} role="status">{state ? statusLabels[state.status] : '자동 저장'}</span>{state?.message && <p role="alert">{state.message}</p>}{state?.status === 'error' && <button className="text-button" onClick={flush}>다시 저장</button>}{['conflict', 'invalid'].includes(state?.status || '') && <button className="text-button" disabled={disabled} onClick={restore}>최신값 불러오기</button>}<button className="text-button" disabled={disabled || state?.status === 'saving'} onClick={remove}>삭제<span className="sr-only"> {row.subcategory}</span></button></div></td>
  </tr>;
}

function PayerSelect({ value, options, disabled, onChange }: { value: string; options: string[]; disabled: boolean; onChange: (value: string) => void }) {
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState('');
  const customInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (custom) customInput.current?.focus(); }, [custom]);
  function commit() { if (text.trim()) onChange(text.trim()); setCustom(false); }
  if (custom) return <input ref={customInput} aria-label="새 결제자" value={text} maxLength={100} disabled={disabled} placeholder="결제자 이름" onChange={event => setText(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commit(); } if (event.key === 'Escape') { event.preventDefault(); setCustom(false); } }} />;
  return <select aria-label="결제자" value={value} disabled={disabled} onChange={event => { if (event.target.value === '__custom__') { setText(''); setCustom(true); } else onChange(event.target.value); }}><option value="">미지정</option>{[...new Set([...options, value])].filter(Boolean).map(option => <option key={option}>{option}</option>)}<option value="__custom__">직접 입력…</option></select>;
}
