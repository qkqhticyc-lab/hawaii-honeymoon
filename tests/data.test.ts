import test from 'node:test';
import assert from 'node:assert/strict';
import { days, flights, places, stays, tasks, type Place } from '../src/data/trip.ts';
import { dateLabel, defaultDate, directionUrl, flightLocal, loadChecklist, mapUrl, nightStay, readLocation } from '../src/lib.ts';

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
  assert.equal(tasks.filter(t => t.done).length, 4);
  assert.equal(tasks.length, 23);
  assert.equal(tasks.find(t => t.id === 'diamond')!.done, false);
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
