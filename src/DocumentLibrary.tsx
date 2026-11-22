import { useEffect, useRef, useState, type FormEvent } from 'react';
import { flights, stays } from './data/trip';
import { DOCUMENT_BUCKET, documentLimit, documentTypes, privateTravel, type TravelDocument } from './privateTravel';

export const bookingGroups = [
  ...stays.map(stay => ({ id: `stay:${stay.id}`, label: `숙소 · ${stay.name}` })),
  ...flights.map(flight => ({ id: `flight:${flight.id}`, label: `항공 · ${flight.id}` })),
  { id: 'rental:maui', label: '렌터카 · 마우이' }, { id: 'rental:jeep', label: '렌터카 · 빅아일랜드' },
  { id: 'taxi:oahu', label: '택시 · 오아후 공항' }, { id: 'rental:oahu', label: '렌터카 · 오아후' },
  { id: 'activity:calypso', label: '현지 투어 · 칼립소 몰로키니' }, { id: 'activity:photo', label: '스냅 · 와이키키스튜디오' },
  { id: 'activity:sunrise', label: '입장권 · 할레아칼라 일출' }, { id: 'activity:orchids', label: '식사 · 오키즈' },
  { id: 'activity:resort', label: '체험 · 그랜드 와일레아' }, { id: 'activity:hanauma', label: '입장권 · 하나우마베이' },
  { id: 'activity:diamond', label: '입장권 · 다이아몬드헤드' }, { id: 'other', label: '기타 여행 자료' },
];

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [filter, setFilter] = useState('all');
  const [bookingKey, setBookingKey] = useState(bookingGroups[0].id);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [viewer, setViewer] = useState<{ document: TravelDocument; url: string } | null>(null);
  const [removed, setRemoved] = useState<TravelDocument | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    void privateTravel.from('travel_documents').select('*').is('deleted_at', null).order('created_at').then(({ data, error }) => {
      if (!active) return;
      if (error) setError('자료 목록을 불러오지 못했습니다.'); else setDocuments(data as TravelDocument[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => () => { if (viewer) URL.revokeObjectURL(viewer.url); }, [viewer]);
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (busy || !file) return;
    if (!documentTypes.includes(file.type) || file.size === 0 || file.size > documentLimit) { setError('PNG·JPG·WEBP·PDF 파일을 20MB 이하로 선택해주세요.'); return; }
    setBusy(true); setError(''); setMessage('');
    const path = `uploads/${crypto.randomUUID()}.${file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1]}`;
    const storage = privateTravel.storage.from(DOCUMENT_BUCKET);
    const { error: uploadError } = await storage.upload(path, file, { cacheControl: '0', contentType: file.type, upsert: false });
    if (uploadError) { setError('파일을 저장하지 못했습니다. 다시 시도해주세요.'); setBusy(false); return; }
    const { data, error } = await privateTravel.from('travel_documents').insert({ booking_key: bookingKey, title: title.trim() || file.name, storage_path: path, file_name: file.name, mime_type: file.type, file_size: file.size }).select().single();
    if (error) { await storage.remove([path]); setError('자료 정보를 저장하지 못했습니다. 다시 시도해주세요.'); }
    else { setDocuments(prev => [...prev, data as TravelDocument]); setTitle(''); setFile(null); if (fileInput.current) fileInput.current.value = ''; setMessage('비공개 자료를 저장했습니다.'); }
    setBusy(false);
  }
  async function open(document: TravelDocument) {
    if (busy) return;
    setBusy(true); setError('');
    const { data, error } = await privateTravel.storage.from(DOCUMENT_BUCKET).download(document.storage_path);
    if (error) setError('자료를 열지 못했습니다. 로그인 상태와 연결을 확인해주세요.');
    else setViewer({ document, url: URL.createObjectURL(data) });
    setBusy(false);
  }
  async function remove(document: TravelDocument) {
    if (busy) return;
    setBusy(true); setError('');
    const { error } = await privateTravel.from('travel_documents').update({ deleted_at: new Date().toISOString() }).eq('id', document.id).is('deleted_at', null).select('id').single();
    if (error) setError('자료를 삭제하지 못했습니다.');
    else { setRemoved(document); setDocuments(prev => prev.filter(item => item.id !== document.id)); setMessage('자료를 목록에서 삭제했습니다.'); }
    setBusy(false);
  }
  async function undoRemove() {
    if (!removed || busy) return;
    setBusy(true);
    const { error } = await privateTravel.from('travel_documents').update({ deleted_at: null }).eq('id', removed.id).select('id').single();
    if (error) setError('자료를 복구하지 못했습니다.');
    else { setDocuments(prev => [...prev, removed]); setRemoved(null); setMessage('자료를 복구했습니다.'); }
    setBusy(false);
  }
  const visible = documents.filter(document => filter === 'all' || document.booking_key === filter);
  return <div className="document-library">
    <div className="document-toolbar"><label>예약별 자료<select aria-label="예약별 자료" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">전체 자료</option>{bookingGroups.map(group => <option key={group.id} value={group.id}>{group.label}</option>)}</select></label><span>{visible.length}개</span></div>
    {error && <p className="notice" role="alert">{error}</p>}
    <div className="private-feedback" role="status">{message}{removed && <button className="text-button" disabled={busy} onClick={() => void undoRemove()}>삭제 취소</button>}</div>
    {loading ? <p role="status">자료를 불러오는 중입니다.</p> : <div className="document-grid">{visible.map(document => <article className="paper-card document-card" key={document.id}><span className="eyebrow">{document.mime_type === 'application/pdf' ? 'PDF' : 'IMAGE'}</span><h4>{document.title}</h4><p>{bookingGroups.find(group => group.id === document.booking_key)?.label || '기타 자료'}</p><small>{(document.file_size / 1024).toFixed(0)} KB</small><div className="private-actions"><button className="secondary-button" disabled={busy} onClick={() => void open(document)}>자료 열기<span className="sr-only"> {document.title}</span></button><button className="text-button" disabled={busy} onClick={() => void remove(document)}>삭제<span className="sr-only"> {document.title}</span></button></div></article>)}</div>}
    {!loading && visible.length === 0 && <p className="empty-state">등록된 자료가 없습니다. 예약확인서나 이미지를 추가해주세요.</p>}
    <details className="paper-card document-upload"><summary>예약확인서·자료 추가</summary><form onSubmit={upload}><fieldset disabled={busy}><legend className="sr-only">비공개 자료 업로드</legend><label>관련 예약<select aria-label="관련 예약" value={bookingKey} onChange={event => setBookingKey(event.target.value)}>{bookingGroups.map(group => <option key={group.id} value={group.id}>{group.label}</option>)}</select></label><label>자료 제목<input value={title} maxLength={200} onChange={event => setTitle(event.target.value)} /></label><label>이미지 또는 PDF<input ref={fileInput} required type="file" accept={documentTypes.join(',')} onChange={event => setFile(event.target.files?.[0] || null)} /></label><p className="footnote">PNG·JPG·WEBP·PDF · 최대 20MB</p><button className="primary-button" disabled={!file || busy}>{busy ? '저장 중…' : '비공개 자료 저장'}</button></fieldset></form></details>
    {viewer && <DocumentViewer document={viewer.document} url={viewer.url} onClose={() => setViewer(null)} />}
  </div>;
}

function DocumentViewer({ document, url, onClose }: { document: TravelDocument; url: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); return () => { dialog.current?.close(); }; }, []);
  return <dialog ref={dialog} className="document-viewer" aria-labelledby="document-viewer-title" onCancel={event => { event.preventDefault(); onClose(); }}><div className="viewer-heading"><h3 id="document-viewer-title">{document.title}</h3><button className="secondary-button" onClick={onClose}>닫기</button></div><div className="viewer-content">{document.mime_type === 'application/pdf' ? <iframe src={url} title={document.title} /> : <img src={url} alt={document.title} />}</div><a href={url} download={document.file_name}>원본 다운로드 ↗</a></dialog>;
}
