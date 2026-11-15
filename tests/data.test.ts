import test from 'node:test';
import assert from 'node:assert/strict';
import { days, flights, places, stays, tasks, transport, type Place } from '../src/data/trip.ts';
import { dateLabel, defaultDate, directionUrl, flightLocal, loadChecklist, mapUrl, milestones, nightStay, readLocation, STORAGE_KEY } from '../src/lib.ts';
import { mapLocations } from '../src/data/mapLocations.ts';
import { coordinate, mapSegments, mapStops } from '../src/mapModel.ts';

test('15 consecutive date-only days and correct weekdays', () => {
  assert.equal(days.length, 15);
  days.forEach((d, i) => assert.equal(d.date, `2026-12-${12 + i}`));
  assert.match(dateLabel('2026-12-12'), /토요일/);
  assert.match(dateLabel('2026-12-26'), /토요일/);
  for (const d of days) for (const event of d.events) assert.ok(places[event.place]);
});
test('checkout is exclusive; 5 + 4 + 4 nights, correct transition days', () => {
  assert.deepEqual(stays.map(s => days.filter(d => nightStay(d.date)?.id === s.id).length), [5, 4, 4]);
  assert.equal(nightStay('2026-12-17')?.id, 'kona');
  assert.equal(nightStay('2026-12-21')?.id, 'kalai');
  assert.equal(nightStay('2026-12-25'), undefined);
  assert.equal(nightStay('2026-12-26'), undefined);
  assert.equal(days[5].departureStay, 'grand');
  assert.equal(days[9].departureStay, 'kona');
  assert.equal(days[13].departureStay, 'kalai');
});
test('flight instants preserve actual chronology and supplied durations', () => {
  const durations = [470, 45, 40, 50, 655];
  flights.forEach((f, i) => {
    assert.equal((Date.parse(f.arrival) - Date.parse(f.departure)) / 60000, durations[i]);
    assert.equal(f.status, '확정');
    if (i) assert.ok(Date.parse(f.departure) > Date.parse(flights[i - 1].arrival));
  });
  const outbound = flights[0], inbound = flights[4];
  assert.equal(flightLocal(outbound.departure, outbound.departureZone).time, '20:50');
  assert.equal(flightLocal(outbound.arrival, outbound.arrivalZone).time, '09:40');
  assert.match(flightLocal(inbound.departure, inbound.departureZone).date, /25/);
  assert.match(flightLocal(inbound.arrival, inbound.arrivalZone).date, /26/);
  assert.deepEqual(days[0].events.filter(e => e.flightId).map(e => e.flightId), ['KE053', 'AS1096']);
  assert.equal((Date.parse(flights[1].departure) - Date.parse(flights[0].arrival)) / 60000, 147);
});
test('planning remains planning; only known reservations are confirmed', () => {
  for (const [date, title] of [['2026-12-18', '조건 확인 후 정상 이동 · 일몰 관람'], ['2026-12-22', '와이키키 시내 렌터카 인수'], ['2026-12-23', '하나우마베이 스노클링'], ['2026-12-23', '커플 스냅 촬영 · 미예약'], ['2026-12-24', 'Diamond Head State Monument 입장 · 정상 등산']]) {
    assert.equal(days.find(d => d.date === date)!.events.find(e => e.title === title)!.status, '계획');
  }
  assert.equal(days[2].events.find(e => e.place === 'haleakala')!.status, '확정');
  assert.equal(days[12].events.find(e => e.place === 'orchids')!.status, '확정');
  assert.equal(tasks.filter(t => t.done).length, 8);
  assert.equal(tasks.length, 25);
  assert.equal(tasks.find(t => t.id === 'diamond')!.done, true);
});
test('unknown locations cannot accidentally become navigation destinations', () => {
  assert.equal((places.kona as Place).query, undefined);
  assert.equal(mapUrl('kona'), undefined);
  assert.equal(directionUrl({ mode: '차량', stops: ['koa', 'kona'] }), undefined);
  assert.equal(directionUrl({ mode: '비행기', stops: ['hnl', 'ogg'] }), undefined);
  assert.match(directionUrl({ mode: '도보', stops: ['kalai', 'orchids', 'kalai'] })!, /waypoints=/);
});
test('date URLs survive invalid input, dates outside trip, and timezone boundaries', () => {
  assert.equal(defaultDate(new Date('2026-11-01T00:00:00Z')), '2026-12-12');
  assert.equal(defaultDate(new Date('2027-01-01T00:00:00Z')), '2026-12-12');
  assert.equal(defaultDate(new Date('2026-12-18T08:00:00Z')), '2026-12-17');
  assert.deepEqual(readLocation('#view=daily&date=2026-12-24'), { date: '2026-12-24', view: 'daily' });
  assert.deepEqual(readLocation('#view=bad&date=2026-12-99', new Date('2026-11-01Z')), { date: '2026-12-12', view: 'daily' });
});
test('checklist corrupt storage recovery and safe partial migration', () => {
  assert.equal(loadChecklist('broken').bookings, true);
  assert.equal(loadChecklist('null').bookings, true);
  assert.equal(loadChecklist('[]').bookings, true);
  assert.equal(loadChecklist('{"bookings":false,"esta":true,"molokini":"yes"}').bookings, false);
  assert.equal(loadChecklist('{"esta":true}').esta, true);
  assert.equal(loadChecklist('{"molokini":"yes"}').molokini, true);
});

test('confirmed resort activities lead each day once and reuse the resort location', () => {
  for (const [date, title, time] of [
    ['2026-12-13', '그랜드 와일레아 무료 스노클링 데모', '07:30~08:00 · 예약'],
    ['2026-12-16', 'Beach Bliss Yoga', '07:00 · 예약'],
    ['2026-12-17', 'Beginners Hula · 무료 입문 훌라', '07:00 · 선택한 시작 시각'],
  ]) {
    const day = days.find(d => d.date === date)!;
    assert.equal(day.events.filter(e => e.title === title).length, 1);
    assert.equal(day.events[0].title, title);
    assert.equal(day.events[0].time, time);
    assert.equal(day.events[0].status, '확정');
    assert.equal(day.events[0].place, 'grand');
    assert.match(day.events[0].notes.join(' '), /무료 · 성인 2명/);
  }
  const demo = days.find(d => d.date === '2026-12-13')!.events[0];
  assert.ok(demo.notes.includes('07:15까지 Grand Wailea Scuba Pool 도착. 수영장 장비 사용 및 안전 연습.'));
  assert.ok(!days.some(d => d.events.some(e => e.title === '호텔 무료 스노클링 입문 수업')));
  const dec16 = days.find(d => d.date === '2026-12-16')!;
  assert.ok(dec16.events.some(e => e.title === '문화 체험 · 스파 중 선택' && e.status === '선택'));
  assert.equal(dec16.events.filter(e => /Yoga|요가/.test(e.title)).length, 1);
  assert.ok(dec16.events[0].notes.includes('집합 장소와 종료 시각은 미확인.'));
  const dec17 = days.find(d => d.date === '2026-12-17')!;
  assert.ok(dec17.events[0].notes.includes('확인 메일에는 날짜·인원만 표시. 집합 장소와 종료 시각은 체크인 때 확인.'));
  assert.equal(dec17.events.find(e => e.title === '주유 후 OGG Hertz 반납')!.time, '11:30 · 예약');
  assert.ok(dec17.events.some(e => e.flightId === 'WN2618'));
  assert.equal(flights.find(f => f.id === 'WN2618')!.departure, '2026-12-17T13:35:00-10:00');
});

test('updated preparation defaults preserve existing saved values and add the Kalai email separately', () => {
  assert.equal(STORAGE_KEY, 'hawaii-honeymoon.checklist.v1');
  assert.equal(new Set(tasks.map(t => t.id)).size, tasks.length);
  const defaults = loadChecklist(null);
  assert.equal(defaults.diamond, true);
  assert.equal(defaults.email, true);
  assert.equal(defaults['email-kalai'], false);
  assert.equal(tasks.find(t => t.id === 'email')!.place, 'grand');
  assert.equal(tasks.find(t => t.id === 'email-kalai')!.place, 'kalai');
  const existing = loadChecklist('{"diamond":false,"email":false,"molokini":true}');
  assert.equal(existing.diamond, false);
  assert.equal(existing.email, false);
  assert.equal(existing.molokini, true);
  assert.equal(existing['email-kalai'], false);
});

test('map references have sources and never invent accommodation or meeting points', () => {
  for (const location of Object.values(mapLocations)) {
    assert.ok(Number.isFinite(location.lat) && Math.abs(location.lat) <= 90);
    assert.ok(Number.isFinite(location.lng) && Math.abs(location.lng) <= 180);
    assert.match(location.source, /^https:\/\//);
    assert.ok(location.label.length > 0);
  }
  for (const id of ['kona', 'stars', 'photo', 'coffee', 'village', 'macadamia', 'lunch'] as const) assert.equal(mapLocations[id], undefined);
  assert.ok(Math.abs(coordinate('icn')![1] - coordinate('hnl')![1]) < 90);
});

test('map route lines break at unknown stops and numbering is stable on return visits', () => {
  const segments = mapSegments([{ mode: '차량', stops: ['grand', 'kona', 'haleakala', 'grand'] }]);
  assert.deepEqual(segments.map(s => [s.from, s.to]), [['haleakala', 'grand']]);
  const stops = mapStops([{ mode: '도보', stops: ['grand', 'wailea', 'grand'] }]);
  assert.deepEqual(stops.map(s => [s.id, s.number]), [['grand', 1], ['wailea', 2]]);
  const day18 = mapSegments(days.find(d => d.date === '2026-12-18')!.routes);
  assert.deepEqual(day18.map(s => [s.from, s.to]), [['visitor', 'summit']]);
});

test('Oahu main routes match day rental, Hanauma return and separate hiking/dinner transport', () => {
  const dec22 = days.find(d => d.date === '2026-12-22')!;
  const dec23 = days.find(d => d.date === '2026-12-23')!;
  const dec24 = days.find(d => d.date === '2026-12-24')!;
  assert.deepEqual(dec22.routes, [{ mode: '차량', stops: ['kalai', 'dole', 'outlet', 'kalai'], note: '당일 렌트 계획' }]);
  assert.deepEqual(dec23.routes.map(r => [r.mode, r.stops]), [['교통편 미정', ['kalai', 'hanauma', 'kalai']]]);
  assert.deepEqual(dec24.routes.map(r => [r.mode, r.stops]), [
    ['차량', ['kalai', 'diamondPark', 'kalai']], ['도보', ['kalai', 'orchids', 'kalai']],
  ]);
  assert.equal(places.diamondPark.query, 'Diamond Head State Monument');
  assert.match(places.diamond.name, /비치 전망대/);
  assert.equal(mapLocations.diamondPark, undefined);
  assert.equal(mapLocations.photo, undefined);
  assert.deepEqual(mapSegments([dec24.routes[0]]), []);
  assert.equal(mapSegments([dec24.routes[1]]).length, 2);
  for (const id of ['diamond', 'kahala', 'village', 'macadamia', 'chinaman', 'sunset'] as const) {
    assert.ok(!days.some(d => d.events.some(e => e.place === id) || d.routes.some(r => r.stops.includes(id))), id);
  }
  assert.ok(!days.some(d => d.routes.some(r => r.mode === '투어 차량')));
  const detours = dec23.events.filter(e => e.status === '선택');
  assert.equal(detours.length, 1);
  assert.match(detours[0].title, /할로나 블로우홀 또는 샌디비치 한 곳/);
  assert.match(dec23.events.find(e => e.place === 'photo')!.notes.join(' '), /작가와 합의한 실제 촬영 시각은 미확정/);
  assert.equal(dec24.events.find(e => e.place === 'orchids')!.time, '16:45 · 예약');
  assert.equal(dec24.events.find(e => e.place === 'orchids')!.status, '확정');
});

test('retired tour task is inactive while old browser records and new pending reservations coexist', () => {
  assert.ok(!tasks.some(t => t.id === 'tour'));
  for (const id of ['oahu-day-rental', 'diamond-head-entry', 'hanauma', 'photo']) assert.equal(tasks.find(t => t.id === id)!.done, false);
  const migrated = loadChecklist('{"tour":true,"hanauma":true,"photo":true,"bookings":false,"diamond":true}');
  assert.equal(migrated.hanauma, true);
  assert.equal(migrated.photo, true);
  assert.equal(migrated.bookings, false);
  assert.equal(migrated.diamond, true);
  assert.equal(migrated['oahu-day-rental'], false);
  assert.equal(migrated['diamond-head-entry'], false);
  assert.equal(migrated.tour, undefined);
  const oahu = transport[2];
  assert.ok(!/조인|투어 차량/.test(JSON.stringify(oahu)));
  for (const part of ['12/21·25 공항 한인택시 계획', '12/22 와이키키 당일 렌트', '12/23 하나우마베이 왕복 교통 미확정', '12/24 등산 택시 왕복 계획']) assert.ok(oahu.detail.includes(part));
});

test('new target times do not become operator reservations or opening hours', () => {
  const dec12 = days.find(d => d.date === '2026-12-12')!;
  assert.match(dec12.alert!, /09:40 도착 → 12:07 출발/);
  assert.match(dec12.alert!, /2시간 27분/);
  assert.equal(dec12.events.find(e => e.title === 'Hertz 차량 인수')!.time, '14:00 · 예약');
  for (const day of days.filter(d => d.date <= '2026-12-24')) {
    for (const event of day.events.filter(e => e.status !== '확정' && /\d{2}:\d{2}/.test(e.time))) {
      assert.match(event.time, /목표|예상|계획|예약상/, `${day.date}: ${event.title}`);
    }
  }
  const dec14 = days.find(d => d.date === '2026-12-14')!;
  assert.equal(dec14.events[0].time, '03:30~04:00 · 목표');
  assert.equal(dec14.events.find(e => e.place === 'haleakala')!.time, '03:00~07:00 · 예약 입장 구간');
  for (const [date, title, time] of [
    ['2026-12-17', '빅아일랜드 렌터카 인수', '15:00 · 예약'],
    ['2026-12-21', '빅아일랜드 렌터카 반납', '13:00 · 예약'],
  ]) {
    const event = days.find(d => d.date === date)!.events.find(e => e.title === title)!;
    assert.deepEqual([event.time, event.status, event.place], [time, '확정', 'koa']);
  }
  assert.equal(loadChecklist(null).jeep, true);
  assert.equal(loadChecklist(null).maunakea, false);
  assert.equal(transport[1].status, '확정');
  assert.match(transport[1].notes.join(' '), /US\$337\.76.*마우나케아 정상 구간 운행 허용과 보험·면책 범위는 별도 확인 필요/);
});

test('Calypso booking has a separate confirmed dock, land return route and independent checklist default', () => {
  const day = days.find(d => d.date === '2026-12-15')!;
  assert.deepEqual(day.events.slice(0, 3).map(e => [e.time, e.status, e.place]), [
    ['06:25~06:30 · 도착 목표', '계획', 'calypsoSlip'],
    ['06:45까지 · 예약 체크인', '확정', 'calypsoSlip'],
    ['07:30 · 예약 출항', '확정', 'calypsoSlip'],
  ]);
  assert.deepEqual(day.routes.map(r => [r.mode, r.stops]), [
    ['차량', ['grand', 'calypsoSlip', 'grand']], ['보트', ['molokini']],
  ]);
  assert.deepEqual(mapSegments(day.routes).map(s => [s.from, s.to]), [['grand', 'calypsoSlip'], ['calypsoSlip', 'grand']]);
  assert.deepEqual([mapLocations.calypsoSlip!.lat, mapLocations.calypsoSlip!.lng], [20.7902267, -156.5116224]);
  assert.match(mapLocations.calypsoSlip!.source, /20\.7902267.*-156\.5116224/);
  assert.match(day.events[2].notes.join(' '), /하와이 12\/14 07:30 전 = 한국 12\/15 02:30 전/);
  assert.equal(loadChecklist(null).molokini, true);
  assert.equal(loadChecklist('{"molokini":false}').molokini, false);
  assert.equal(loadChecklist('{"molokini":true}').molokini, true);
  assert.equal(tasks.find(t => t.id === 'molokini')!.place, 'calypsoSlip');
  assert.match(days.find(d => d.date === '2026-12-16')!.events.find(e => e.kind === '예비')!.notes.join(' '), /대체 예약은 확보되지 않았습니다/);
});

test('sunset candidate and booking reminders stay pending while milestones derive reservation times', () => {
  const day = days.find(d => d.date === '2026-12-23')!;
  const snap = day.events.find(e => e.place === 'photo')!;
  const task = tasks.find(t => t.id === 'photo')!;
  assert.equal(snap.time, '선셋 시간대 · 촬영 장소와 시작 시각 미확정');
  assert.equal(snap.status, '계획');
  assert.equal(task.done, false);
  assert.equal(task.note, snap.notes.join(' '));
  assert.deepEqual(task.links, snap.links);
  assert.ok(!JSON.stringify(day).includes('17:20'));
  for (const phrase of ['검토 중', '알로하 선셋 A', '이동 포함 90분', '예약금 10만원 + 현장 $320', '마케팅 사용 범위', '미동의 요금', '17:55']) {
    assert.ok(task.note!.includes(phrase), phrase);
  }
  assert.match(tasks.find(t => t.id === 'hanauma')!.note!, /하와이 12\/21 07:00 = 한국 12\/22 02:00/);
  assert.match(tasks.find(t => t.id === 'diamond-head-entry')!.note!, /하와이 11\/24부터/);
  for (const [hawaii, korea] of [['2026-12-14T07:30:00-10:00', '2026-12-15T02:30:00+09:00'], ['2026-12-21T07:00:00-10:00', '2026-12-22T02:00:00+09:00']]) {
    assert.equal(Date.parse(hawaii), Date.parse(korea));
  }
  assert.equal((Date.parse('2026-12-24T12:00:00-10:00') - Date.parse('2026-11-24T12:00:00-10:00')) / 86400000, 30);
  assert.deepEqual(milestones.map(m => m.date), ['2026-12-12', '2026-12-14', '2026-12-15', '2026-12-17', '2026-12-21', '2026-12-24', '2026-12-25', '2026-12-26']);
  for (const day of days) for (const event of day.events.filter(e => e.milestone)) {
    assert.ok(milestones.some(m => m.date === day.date && m.text.includes(event.time)));
  }
});
