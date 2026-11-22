import { createClient } from '@supabase/supabase-js';

export const privateTravel = createClient(
  'https://yotovkfapovldvrfcaea.supabase.co',
  'sb_publishable_Fq69HuTdPcTr_Pnh9JvC_A_AddqDMEb',
  { auth: { flowType: 'pkce', storageKey: 'hawaii-honeymoon.auth.v1', detectSessionInUrl: true }, global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) } },
);
export const DOCUMENT_BUCKET = 'travel-private';
export const documentTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
export const documentLimit = 20 * 1024 * 1024;

export type Expense = {
  id: string; category: string; subcategory: string; vendor: string;
  direction: '지출' | '수입'; amount: number | null; currency: 'KRW' | 'USD';
  payer: string; payment_method: string; payment_date: string;
  status: '예정' | '결제 완료' | '취소'; memo: string; sort_order: number;
  revision: number; deleted_at: string | null;
};
export type ExpenseInput = Omit<Expense, 'id' | 'revision' | 'deleted_at'>;
export type TravelDocument = {
  id: string; booking_key: string; title: string; storage_path: string;
  file_name: string; mime_type: string; file_size: number;
};

export function expenseTotals(rows: Expense[]) {
  const totals = { KRW: { planned: 0, paid: 0, income: 0 }, USD: { planned: 0, paid: 0, income: 0 } };
  for (const row of rows) {
    if (row.deleted_at || row.status === '취소' || row.amount === null) continue;
    const field = row.direction === '수입' ? 'income' : row.status === '예정' ? 'planned' : 'paid';
    totals[row.currency][field] = Math.round((totals[row.currency][field] + Number(row.amount)) * 100) / 100;
  }
  return totals;
}
export function money(value: number, currency: 'KRW' | 'USD') {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency, maximumFractionDigits: currency === 'KRW' ? 0 : 2 }).format(value);
}
