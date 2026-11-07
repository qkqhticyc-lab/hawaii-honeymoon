import test from 'node:test';
import assert from 'node:assert/strict';
import { days, flights, places, stays, tasks, type Place } from '../src/data/trip.ts';
import { dateLabel, defaultDate, directionUrl, flightLocal, loadChecklist, mapUrl, nightStay, readLocation, STORAGE_KEY } from '../src/lib.ts';
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
  for (const [date, title] of [['2026-12-15', '몰로키니 스노클링 투어'], ['2026-12-18', '조건 확인 후 정상 이동 · 일몰 관람'], ['2026-12-22', '오아후 일주 조인 투어'], ['2026-12-23', '하나우마베이 스노클링'], ['2026-12-23', '커플 스냅 촬영']]) {
    assert.equal(days.find(d => d.date === date)!.events.find(e => e.title === title)!.status, '계획');
  }
  assert.equal(days[2].events.find(e => e.place === 'haleakala')!.status, '확정');
  assert.equal(days[12].events.find(e => e.place === 'orchids')!.status, '확정');
  assert.equal(tasks.filter(t => t.done).length, 6);
  assert.equal(tasks.length, 24);
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
  assert.equal(loadChecklist('{"molokini":"yes"}').molokini, false);
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
  assert.equal(dec17.events[2].time, '11:30 · 예약');
  assert.equal(dec17.events[3].flightId, 'WN2618');
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
