import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { privateTravel } from './privateTravel';

type Access = { state: 'loading' | 'signed-out' | 'owner' | 'denied' | 'error'; userId?: string; error: string; login: () => Promise<void>; logout: () => Promise<void>; retry: () => void; registerUnsavedCheck: (check: () => boolean) => () => void };
const AccessContext = createContext<Access | null>(null);

export function PrivateAccessProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Pick<Access, 'state' | 'userId' | 'error'>>({ state: 'loading', error: '' });
  const [attempt, setAttempt] = useState(0);
  const unsavedChecks = useRef(new Set<() => boolean>());
  const registerUnsavedCheck = useCallback((check: () => boolean) => { unsavedChecks.current.add(check); return () => { unsavedChecks.current.delete(check); }; }, []);
  useEffect(() => {
    let active = true;
    let revision = 0;
    async function check(session: Session | null) {
      const current = ++revision;
      if (!active) return;
      setAccess(previous => session && previous.userId === session.user.id && previous.state === 'owner' ? previous : { state: session ? 'loading' : 'signed-out', error: '' });
      if (!session) return;
      const { data, error } = await privateTravel.rpc('travel_owner');
      if (!active || current !== revision) return;
      setAccess(error ? { state: 'error', error: '접근 권한을 확인하지 못했습니다. 다시 시도해주세요.' } : { state: data === true ? 'owner' : 'denied', userId: session.user.id, error: '' });
    }
    void privateTravel.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) { setAccess({ state: 'error', error: '로그인을 완료하지 못했습니다. 다시 로그인해주세요.' }); return; }
      const returnHash = sessionStorage.getItem('hawaii-honeymoon.return-hash');
      if (data.session && returnHash) {
        const hash = returnHash.startsWith('#view=') ? returnHash : '#view=expenses&date=2026-12-12';
        window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
        sessionStorage.removeItem('hawaii-honeymoon.return-hash');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
      void check(data.session);
    }).catch(() => { if (active) setAccess({ state: 'error', error: '로그인 정보를 불러오지 못했습니다.' }); });
    const { data } = privateTravel.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION') window.setTimeout(() => { void check(session); }, 0);
    });
    return () => { active = false; revision++; data.subscription.unsubscribe(); };
  }, [attempt]);
  async function login() {
    try {
      sessionStorage.setItem('hawaii-honeymoon.return-hash', window.location.hash);
      const { error } = await privateTravel.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}${window.location.pathname}` } });
      if (error) throw error;
    } catch { setAccess({ state: 'error', error: 'GitHub 로그인을 시작하지 못했습니다. 다시 시도해주세요.' }); }
  }
  async function logout() {
    if ([...unsavedChecks.current].some(check => check())) { setAccess(previous => ({ ...previous, error: '경비 변경이 아직 저장되지 않았습니다. 저장 완료를 확인한 뒤 로그아웃해주세요.' })); return; }
    const { error } = await privateTravel.auth.signOut();
    if (error) { setAccess(prev => ({ ...prev, error: '로그아웃하지 못했습니다. 다시 시도해주세요.' })); return; }
    setAccess({ state: 'signed-out', error: '' });
  }
  return <AccessContext.Provider value={{ ...access, login, logout, retry: () => setAttempt(n => n + 1), registerUnsavedCheck }}>{children}</AccessContext.Provider>;
}
export function usePrivateAccess() {
  const access = useContext(AccessContext);
  if (!access) throw new Error('PrivateAccessProvider is required');
  return access;
}
export function PrivateGate({ children }: { children: ReactNode }) {
  const access = usePrivateAccess();
  if (access.state === 'owner') return <><div className="private-session"><span>비공개 · qkqhticyc-lab</span><button className="text-button" onClick={() => void access.logout()}>로그아웃</button></div>{access.error && <p role="alert">{access.error}</p>}{children}</>;
  return <div className="paper-card private-gate">
    <h3>개인 자료</h3>
    <p>{access.state === 'loading' ? '로그인 정보를 확인하고 있습니다.' : access.state === 'denied' ? '이 GitHub 계정에는 접근 권한이 없습니다. qkqhticyc-lab 계정으로 로그인해주세요.' : '예약확인서와 경비는 본인 GitHub 계정으로 로그인한 뒤 열 수 있습니다.'}</p>
    {access.error && <p role="alert">{access.error}</p>}
    {access.state !== 'loading' && <div className="private-actions">{access.state === 'denied' ? <button className="primary-button" onClick={() => void access.logout()}>다른 계정으로 로그인</button> : <button className="primary-button" onClick={() => void access.login()}>GitHub로 로그인</button>}{access.state === 'error' && <button className="secondary-button" onClick={access.retry}>다시 확인</button>}</div>}
  </div>;
}
