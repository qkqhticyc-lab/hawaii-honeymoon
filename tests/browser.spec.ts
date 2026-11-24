import { test, expect, type Page } from '@playwright/test';

// Test map behavior against local geographic data, independent of a public tile server.
test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
  await page.route('https://open.er-api.com/v6/latest/USD', route => route.fulfill({ json: { result: 'success', base_code: 'USD', rates: { KRW: 1500 }, time_last_update_unix: Math.floor(Date.now() / 1000), time_next_update_unix: Math.floor(Date.now() / 1000) + 86400 } }));
});

test('all days and views render without horizontal overflow or JavaScript errors', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Our Hawaii Honeymoon' })).toBeVisible();
  for (let day = 12; day <= 26; day++) {
    await page.goto(`./#view=daily&date=2026-12-${day}`);
    await expect(page.locator('.date-button.selected')).toContainText(String(day));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.timeline > li').first()).toBeVisible();
  }
  for (const view of ['overview', 'bookings', 'prepare', 'expenses']) {
    await page.goto(`./#view=${view}&date=2026-12-24`);
    await expect(page.locator('nav [aria-current="page"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('./#view=daily&date=2026-12-14');
  await page.screenshot({ path: `test-results/${testInfo.project.name}-daily.png`, fullPage: true });
  await page.goto('./#view=overview&date=2026-12-14');
  await page.screenshot({ path: `test-results/${testInfo.project.name}-overview.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test('date selection persists through reload and history, with correct accommodation', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-12');
  await page.getByRole('button', { name: /12. 17.*목요일/ }).click();
  await expect(page).toHaveURL(/date=2026-12-17/);
  await page.reload();
  await expect(page.locator('.stay-card')).toContainText('그랜드 와일레아');
  await expect(page.locator('.stay-card')).toContainText('Kona Shores Condominium');
  await page.getByRole('button', { name: /12. 21.*월요일/ }).click();
  await expect(page.locator('.stay-card')).toContainText('Kona Shores Condominium');
  await expect(page.locator('.stay-card')).toContainText('카라이 와이키키');
  await page.goBack();
  await expect(page.locator('.date-button.selected')).toHaveText(/17/);
  await page.goto('./#view=daily&date=2026-12-25');
  await expect(page.locator('.stay-card')).toContainText('호텔 숙박 없음');
  await expect(page.locator('.flight-times')).toContainText('12. 26.');
});

test('checklist persists, filters work, and stored checks do not confirm itinerary', async ({ page }) => {
  await page.goto('./#view=prepare&date=2026-12-23');
  await expect(page.getByLabel('항공·숙소 예약', { exact: true })).toBeChecked();
  const checkbox = page.getByLabel('하나우마베이 입장권 2인 예약', { exact: true });
  await checkbox.check();
  await page.getByRole('button', { name: '체크 내용 저장', exact: true }).click();
  await expect(page.locator('.save-status')).toContainText('저장했어요');
  await page.reload();
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: /남은 준비/ }).click();
  await expect(checkbox).toHaveCount(0);
  await page.getByRole('button', { name: /^완료/ }).click();
  await expect(checkbox).toBeChecked();
  await page.goto('./#view=daily&date=2026-12-23');
  await expect(page.locator('.timeline > li').first().locator('.badge')).toHaveText('계획');
});

test('keyboard access, touch targets, map links and flight chronology', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-12');
  await expect(page.locator('.skip-link')).toBeAttached();
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const button = page.getByRole('button', { name: /12. 14.*월요일/ });
  await button.focus(); await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  const summary = page.locator('summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  for (const target of await page.locator('button:visible').all()) { const box = await target.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44); }
  const map = page.getByRole('link', { name: /할레아칼라 정상 구역 Google Maps 검색/ }).first();
  expect(new URL((await map.getAttribute('href'))!).searchParams.get('query')).toContain('Haleakala');
  await expect(map).toHaveAttribute('target', '_blank');
  await page.goto('./#view=daily&date=2026-12-12');
  const flights = page.locator('.flight-times');
  await expect(flights.nth(0)).toContainText('20:50');
  await expect(flights.nth(0)).toContainText('09:40');
  await expect(flights.nth(1)).toContainText('12:07');
});

test('storage failure does not break itinerary or preparation screen', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); }; });
  await page.goto('./#view=prepare&date=2026-12-12');
  await page.getByLabel('하나우마베이 입장권 2인 예약', { exact: true }).check();
  await page.getByRole('button', { name: '체크 내용 저장', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('저장하지 못했어요');
  await expect(page.locator('.save-status')).toContainText('저장 전 변경 1개');
  await expect(page.getByLabel('하나우마베이 입장권 2인 예약', { exact: true })).toBeChecked();
});

test('checklist changes stay as drafts until save; cancellation and saved unchecking persist', async ({ page }) => {
  await page.goto('./#view=prepare&date=2026-12-23');
  const checkbox = page.getByLabel('하나우마베이 입장권 2인 예약', { exact: true });
  const save = page.getByRole('button', { name: '체크 내용 저장', exact: true });
  await expect(save).toBeDisabled();
  await checkbox.check();
  await expect(page.locator('.save-status')).toContainText('저장 전 변경 1개');
  expect(await page.evaluate(() => localStorage.getItem('hawaii-honeymoon.checklist.v1'))).toBeNull();
  await page.reload();
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await page.locator('nav a').filter({ hasText: '날짜별 일정' }).click();
  await expect(page.locator('.day-task-card')).toContainText('하나우마베이 입장권 2인 예약');
  await page.locator('nav a').filter({ hasText: '준비할 일' }).click();
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: '변경 취소', exact: true }).click();
  await expect(checkbox).not.toBeChecked();
  await expect(save).toBeDisabled();
  await checkbox.check();
  await save.click();
  await expect(save).toBeDisabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hawaii-honeymoon.checklist.v1')!).hanauma)).toBe(true);
  await page.reload();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await save.click();
  await page.reload();
  await expect(checkbox).not.toBeChecked();
});

test('skip link preserves selected day and all status labels meet 4.5:1 contrast', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-24');
  await expect(page.locator('.skip-link')).toBeAttached();
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(/date=2026-12-24/);
  const ratios = await page.locator('footer .badge').evaluateAll(elements => {
    const luminance = (rgb: string) => {
      const channels = rgb.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => {
        const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    return elements.map(el => { const style = getComputedStyle(el); const fg = luminance(style.color), bg = luminance(style.backgroundColor); return { label: el.textContent, ratio: (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05) }; });
  });
  for (const result of ratios) expect(result.ratio, result.label!).toBeGreaterThanOrEqual(4.5);
});

test('interactive daily map selects destinations, zooms and falls back without tiles', async ({ page }, testInfo) => {
  await page.goto('./#view=daily&date=2026-12-14');
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  await page.locator('.map-destinations button').filter({ hasText: '할레아칼라 정상 구역' }).click();
  await expect(page.locator('.map-selection')).toContainText('할레아칼라 정상 구역 대표 위치');
  await expect(page.locator('.destination-marker.is-selected')).toHaveAttribute('title', /할레아칼라/);
  await page.getByRole('button', { name: '지도 확대', exact: true }).click();
  await page.getByRole('button', { name: '지도 축소', exact: true }).click();
  await page.getByRole('button', { name: '전체 목적지 맞추기' }).click();
  const mapBox = (await page.locator('.day-map').boundingBox())!;
  for (const marker of await page.locator('.destination-marker').all()) {
    const markerBox = (await marker.boundingBox())!;
    expect(markerBox.x).toBeGreaterThanOrEqual(mapBox.x);
    expect(markerBox.x + markerBox.width).toBeLessThanOrEqual(mapBox.x + mapBox.width);
  }
  await expect(page.locator('.map-load-note')).toBeVisible();
  await page.getByRole('button', { name: '거리 지도 켜짐' }).click();
  await expect(page.locator('.day-map .leaflet-tile')).toHaveCount(0);
  await expect(page.locator('.day-map .leaflet-landBase-pane path')).toHaveCount(1);
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.day-map-panel').screenshot({ path: `test-results/${testInfo.project.name}-map.png` });
});

test('map changes routes and dates and distinguishes Kona Shores from an unknown stop', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-17');
  await page.locator('.map-filters button').filter({ hasText: '2. 비행기' }).click();
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  await expect(page.locator('.map-destinations')).toContainText('OGG');
  await expect(page.locator('.map-destinations')).not.toContainText('그랜드');
  await page.getByRole('button', { name: /12. 18.*금요일/ }).click();
  await expect(page.locator('.map-filters button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.destination-marker')).toHaveCount(3);
  await expect(page.locator('.destination-marker[title*="Kona Shores Condominium"]')).toHaveCount(1);
  await page.locator('.map-destinations button').filter({ hasText: 'Kona Shores Condominium' }).click();
  await expect(page.locator('.map-selection')).toContainText('단지 대표 위치');
  await page.goto('./#view=daily&date=2026-12-12');
  await expect(page.locator('.destination-marker[title*="ICN"]')).toHaveCount(0);
  await page.getByRole('button', { name: '한국까지 보기' }).click();
  await expect(page.locator('.destination-marker[title*="ICN"]')).toHaveCount(1);
  await page.getByRole('button', { name: '하와이만 보기' }).click();
  await expect(page.locator('.destination-marker[title*="ICN"]')).toHaveCount(0);
});

test('confirmed Grand Wailea activities appear once before breakfast and retain daily date links', async ({ page }) => {
  for (const [date, title, time] of [
    ['2026-12-13', '그랜드 와일레아 무료 스노클링 데모', '07:30~08:00'],
    ['2026-12-16', 'Beach Bliss Yoga', '07:00'],
    ['2026-12-17', 'Beginners Hula · 무료 입문 훌라', '07:00'],
  ]) {
    await page.goto(`./#view=daily&date=${date}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(1);
    const first = page.locator('.timeline > li').first();
    await expect(first.getByRole('heading')).toHaveText(title);
    await expect(first.locator('.event-time')).toContainText(time);
    await expect(first.locator('.badge')).toHaveText('확정');
    await first.locator('summary').click();
    await expect(first.locator('details')).toContainText('무료 · 성인 2명');
    if (date === '2026-12-13') await expect(first.locator('details')).toContainText('07:15까지 Grand Wailea Scuba Pool 도착');
    if (date === '2026-12-16') {
      await expect(page.getByRole('heading', { name: '문화 체험 · 스파 중 선택', exact: true })).toHaveCount(1);
      await expect(first.locator('details')).toContainText('집합 장소와 종료 시각은 미확인');
    }
    if (date === '2026-12-17') {
      await expect(first.locator('details')).toContainText('확인 메일에는 날짜·인원만 표시');
      await expect(page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: '주유 후 OGG Hertz 반납', exact: true }) })).toContainText('11:30');
      await expect(page.locator('.flight-times')).toContainText('13:35');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`#view=daily&date=${date}$`));
    await expect(page.locator('.timeline > li').first().getByRole('heading')).toHaveText(title);
  }
});

test('preparation defaults show confirmed Diamond and Grand email, with separate pending Kalai email', async ({ page }) => {
  await page.goto('./#view=prepare&date=2026-12-13');
  await expect(page.getByLabel('힐튼 다이아 확보·계정 반영 확인', { exact: true })).toBeChecked();
  await expect(page.getByLabel('그랜드 와일레아 허니문·객실 선호 메일', { exact: true })).toBeChecked();
  await expect(page.getByLabel('카라이 허니문·객실 선호 메일', { exact: true })).not.toBeChecked();
  await expect(page.locator('#task-diamond').locator('..')).toContainText('패스트트랙으로 Hilton Honors Diamond 획득, 앱 반영 확인.');
  await expect(page.locator('#task-email').locator('..')).toContainText('메일 발송 완료, 호텔 회신·객실 업그레이드는 미확인');
  await expect(page.locator('#task-email-kalai').locator('..')).toContainText('11/23~30');
  await expect(page.locator('#task-email-kalai').locator('..')).toContainText('12/14~17');
  expect(await page.evaluate(() => localStorage.getItem('hawaii-honeymoon.checklist.v1'))).toBeNull();
});

test('existing browser preparation records override new defaults without automatic rewriting', async ({ page }) => {
  const previous = JSON.stringify({ diamond: false, email: false, molokini: false, bookings: true });
  await page.addInitScript(value => localStorage.setItem('hawaii-honeymoon.checklist.v1', value), previous);
  await page.goto('./#view=prepare&date=2026-12-13');
  await expect(page.getByLabel('힐튼 다이아 확보·계정 반영 확인', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('그랜드 와일레아 허니문·객실 선호 메일', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('몰로키니 예약', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('카라이 허니문·객실 선호 메일', { exact: true })).not.toBeChecked();
  await expect(page.getByRole('button', { name: '체크 내용 저장', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('hawaii-honeymoon.checklist.v1'))).toBe(previous);
  await page.goto('./#view=daily&date=2026-12-15');
  await expect(page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: '칼립소호 몰로키니 & 터틀타운 스노클링 · 성인 2인 확정', exact: true }) }).locator('.badge')).toHaveText('확정');
  expect(await page.evaluate(() => localStorage.getItem('hawaii-honeymoon.checklist.v1'))).toBe(previous);
});

test('Oahu dates show the replacement itinerary and matching main map routes', async ({ page }, testInfo) => {
  await page.goto('./#view=daily&date=2026-12-22');
  await expect(page.locator('.timeline > li').first()).toContainText('09:00 · 예약');
  await expect(page.locator('.timeline > li').first()).toContainText('와이키키 Hertz 렌터카 인수');
  await expect(page.locator('.timeline')).not.toContainText('조인 투어');
  await expect(page.locator('.timeline')).not.toContainText('호텔 픽업');
  await expect(page.locator('.destination-marker')).toHaveCount(4);
  await expect(page.locator('.map-destinations li')).toHaveCount(4);
  await expect(page.locator('.map-destinations')).toContainText('돌 플랜테이션');
  await expect(page.locator('.map-destinations')).toContainText('와이켈레 아울렛');
  await expect(page.locator('.map-destinations')).not.toContainText('모자섬');
  await expect(page.locator('.map-destinations')).not.toContainText('선셋비치');
  await expect(page.locator('.route-card .mode-label')).toHaveText(['도보', '차량']);
  await expect(page.locator('.route-card')).toContainText('다음 날 반납');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.day-map-panel').screenshot({ path: `test-results/${testInfo.project.name}-oahu-22-map.png` });

  await page.getByRole('button', { name: /12. 23.*수요일/ }).click();
  await expect(page).toHaveURL(/#view=daily&date=2026-12-23$/);
  await expect(page.locator('.timeline > li').first()).toContainText('07:15 전후 · 출발 목표');
  await expect(page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: '하나우마베이 스노클링', exact: true }) })).toContainText('08:00 전후 · 입장 목표');
  await expect(page.locator('.timeline > li').filter({ hasText: '와이키키 Hertz 렌터카 반납' })).toContainText('13:00 · 예약');
  const snap = page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: '커플 선셋 스냅 · 카라이 픽업', exact: true }) });
  await expect(snap).toContainText('16:45 · 픽업 예약');
  await snap.locator('summary').click();
  await expect(snap.locator('details')).toContainText('실제 촬영 시작 시각은 작가 안내 확인');
  await expect(page.getByRole('heading', { name: '할로나 블로우홀 또는 샌디비치 한 곳', exact: true })).toHaveCount(1);
  await expect(page.locator('.destination-marker')).toHaveCount(4);
  await expect(page.locator('.map-destinations li')).toHaveCount(4);
  await expect(page.locator('.map-destinations')).not.toContainText('할로나');
  await expect(page.locator('.map-destinations')).not.toContainText('샌디');
  await expect(page.locator('.map-destinations')).toContainText('카카아코 워터프런트파크');
  await expect(page.locator('.route-card .mode-label')).toHaveText(['차량', '도보', '차량']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.day-map-panel').screenshot({ path: `test-results/${testInfo.project.name}-oahu-23-map.png` });

  await page.getByRole('button', { name: /12. 24.*목요일/ }).click();
  const hike = page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: 'Diamond Head State Monument 입장 · 정상 등산', exact: true }) });
  await expect(hike).toContainText('08:00~10:00 · 목표');
  await expect(hike.locator('.badge')).toHaveText('계획');
  await hike.locator('summary').click();
  await expect(hike.locator('details')).toContainText('입장권 2인 미예약');
  const parkMap = hike.getByRole('link', { name: /다이아몬드헤드 공원 입구·트레일헤드 Google Maps 검색/ });
  expect(new URL((await parkMap.getAttribute('href'))!).searchParams.get('query')).toBe('Diamond Head State Monument');
  const dinner = page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: 'Halekulani Orchids · 크리스마스이브 뷔페', exact: true }) });
  await expect(dinner).toContainText('16:45 · 예약');
  await expect(dinner.locator('.badge')).toHaveText('확정');
  await page.locator('.map-filters button').filter({ hasText: '1. 차량' }).click();
  await expect(page.locator('.map-destinations')).toContainText('다이아몬드헤드 공원 입구·트레일헤드');
  await expect(page.locator('.map-destinations')).toContainText('위치 확인 필요 · 지도 핀 없음');
  await expect(page.locator('.destination-marker')).toHaveCount(1);
  await page.locator('.map-filters button').filter({ hasText: '2. 도보' }).click();
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  await expect(page.locator('.map-destinations')).toContainText('할레쿨라니 오키즈');
  await expect(page.locator('.map-destinations')).not.toContainText('다이아몬드헤드');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.map-filters button').filter({ hasText: '전체 동선' }).click();
  await page.locator('.day-map-panel').screenshot({ path: `test-results/${testInfo.project.name}-oahu-24-map.png` });
  await page.reload();
  await expect(page).toHaveURL(/#view=daily&date=2026-12-24$/);
  await expect(page.getByRole('heading', { name: 'Diamond Head State Monument 입장 · 정상 등산', exact: true })).toBeVisible();
});

test('Oahu transport summary and pending tasks match while legacy tour checks are left intact in storage', async ({ page }) => {
  const stored = JSON.stringify({ tour: true, hanauma: true, photo: true, bookings: false });
  await page.addInitScript(value => localStorage.setItem('hawaii-honeymoon.checklist.v1', value), stored);
  await page.goto('./#view=prepare&date=2026-12-22');
  await expect(page.getByLabel('오아후 조인 투어 예약 확인', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('오아후 Hertz 렌터카 예약', { exact: true })).toBeChecked();
  await expect(page.getByLabel('12/24 다이아몬드헤드 입장권 2인', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('하나우마베이 입장권 2인 예약', { exact: true })).toBeChecked();
  await expect(page.getByLabel('커플 스냅 예약', { exact: true })).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem('hawaii-honeymoon.checklist.v1'))).toBe(stored);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('nav a').filter({ hasText: '숙소·항공' }).click();
  const transport = page.locator('.transport-list');
  await expect(transport).toContainText('하나택시 공항 왕복');
  await expect(transport).toContainText('12/22 09:00 인수 → 12/23 13:00 반납');
  await expect(transport).toContainText('예약 총액 US$101.60');
  await expect(transport).toContainText('12/24 등산 택시 왕복 계획');
  await expect(transport).not.toContainText('조인 투어');
});

test('Calypso dock map and confirmed departure match the default task and overview date links', async ({ page }, testInfo) => {
  await page.goto('./#view=daily&date=2026-12-15');
  const events = page.locator('.timeline > li');
  await expect(events.nth(0)).toContainText('06:25~06:30 · 도착 목표');
  await expect(events.nth(1)).toContainText('06:45까지 · 예약 체크인');
  await expect(events.nth(1).locator('.badge')).toHaveText('확정');
  await expect(events.nth(2)).toContainText('07:30 · 예약 출항');
  await expect(events.nth(2).locator('.badge')).toHaveText('확정');
  await expect(page.locator('.timeline')).not.toContainText('출항지 미정');
  await events.nth(2).locator('summary').click();
  await expect(events.nth(2).locator('details')).toContainText('한국 12/15 02:30 전');
  await page.locator('.map-filters button').filter({ hasText: '1. 차량' }).click();
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  await expect(page.locator('.map-destinations')).toContainText('Slip 76');
  await expect(page.locator('.map-destinations')).not.toContainText('해상 목적지');
  await page.locator('.day-map-panel').screenshot({ path: `test-results/${testInfo.project.name}-calypso-map.png` });
  await page.locator('.map-filters button').filter({ hasText: '2. 보트' }).click();
  await expect(page.locator('.destination-marker')).toHaveCount(1);
  await expect(page.locator('.map-destinations')).toContainText('해상 목적지');
  await expect(page.locator('.day-map .leaflet-overlay-pane path')).toHaveCount(0);
  await page.goto('./#view=prepare&date=2026-12-15');
  await expect(page.getByLabel('몰로키니 예약', { exact: true })).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem('hawaii-honeymoon.checklist.v1'))).toBeNull();
  for (const [date, text] of [['14', '할레아칼라 일출'], ['15', '07:30'], ['24', '16:45']]) {
    await page.goto('./#view=overview&date=2026-12-15');
    const link = page.locator(`.milestones a[href="#view=daily&date=2026-12-${date}"]`);
    await expect(link).toContainText(text);
    await link.click();
    await expect(page.locator('.date-button.selected')).toContainText(date);
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`#view=daily&date=2026-12-${date}$`));
  }
});

test('confirmed sunset pickup, photo route and pending entry reservations are visible', async ({ page }, testInfo) => {
  await page.goto('./#view=daily&date=2026-12-23');
  const snap = page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: '커플 선셋 스냅 · 카라이 픽업', exact: true }) });
  await expect(snap).toContainText('16:45 · 픽업 예약');
  await expect(snap.locator('.badge')).toHaveText('확정');
  await snap.locator('summary').click();
  for (const phrase of ['알로하 선셋 A', '2인 확정', '5~10분', '현장 결제 US$320', '17:55', '실제 촬영 시작 시각은 작가 안내 확인']) {
    await expect(snap.locator('details')).toContainText(phrase);
  }
  await expect(snap.getByRole('link', { name: /카카아코/ })).toHaveAttribute('href', /maps\/search/);
  await expect(snap.getByRole('link', { name: /일몰 참고/ })).toHaveAttribute('href', 'https://www.timeanddate.com/sun/usa/honolulu?month=12&year=2026');
  await expect(page.locator('.map-destinations li')).toHaveCount(4);
  await expect(page.locator('.route-card')).toContainText('카카아코');
  await expect(page.locator('.timeline')).not.toContainText('17:20');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-confirmed-sunset.png`, fullPage: true });
  await page.goto('./#view=prepare&date=2026-12-23');
  await expect(page.locator('#task-photo')).toBeChecked();
  await expect(page.locator('#task-hanauma')).not.toBeChecked();
  await expect(page.locator('#task-diamond-head-entry')).not.toBeChecked();
  await expect(page.locator('#task-photo').locator('..')).toContainText('16:45 카라이 LXR 픽업');
  await expect(page.locator('#task-hanauma').locator('..')).toContainText('하와이 12/21 07:00 = 한국 12/22 02:00');
  await expect(page.locator('#task-hanauma').locator('..').getByRole('link', { name: /공식 예약/ })).toHaveAttribute('href', 'https://pros.hnl.info/hanauma-bay');
  await expect(page.locator('#task-diamond-head-entry').locator('..')).toContainText('하와이 11/24부터');
  await expect(page.locator('#task-diamond-head-entry').locator('..').getByRole('link', { name: /공식 예약 안내/ })).toHaveAttribute('href', 'https://gostateparks.hawaii.gov/diamondhead/about');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('confirmed Hana Taxi transfers appear on each date map and checklist', async ({ page }) => {
  for (const [date, title, time] of [
    ['2026-12-21', '하나택시 공항 픽업 · 카라이 이동', '16:30 · 예약상 항공 도착 기준'],
    ['2026-12-25', '하나택시 호텔 픽업 · 공항 이동', '11:00 · 예약 픽업'],
  ]) {
    await page.goto('./#view=daily&date=' + date);
    const transfer = page.locator('.timeline > li').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(transfer).toContainText(time);
    await expect(transfer.locator('.badge')).toHaveText('확정');
    await expect(page.locator('.route-card')).toContainText('하나택시 예약 확정');
    await expect(page.locator('.map-destinations')).toContainText('HNL');
    await expect(page.locator('.map-destinations')).toContainText('카라이');
  }
  await page.goto('./#view=prepare&date=2026-12-25');
  await expect(page.getByLabel('공항 한인택시 예약', { exact: true })).toBeChecked();
});

async function mockPrivateSession(page: Page, owner: boolean) {
  const sub = '00000000-0000-4000-8000-000000000001';
  const jwt = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-signature`;
  await page.addInitScript(({ jwt, sub }) => localStorage.setItem('hawaii-honeymoon.auth.v1', JSON.stringify({ access_token: jwt, refresh_token: 'test-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer', user: { id: sub, aud: 'authenticated', app_metadata: { provider: 'github' }, user_metadata: {} } })), { jwt, sub });
  await page.route('**/rest/v1/rpc/travel_owner', route => route.fulfill({ json: owner }));
  await page.route('**/auth/v1/logout**', route => route.fulfill({ status: 204 }));
}

test('fifth tab and reservation archive expose a login boundary without private data requests', async ({ page }, testInfo) => {
  const privateRequests: string[] = [];
  page.on('request', request => { if (/travel_expenses|travel_documents|storage\/v1/.test(request.url())) privateRequests.push(request.url()); });
  await page.goto('./#view=expenses&date=2026-12-23');
  await expect(page.locator('nav a').last()).toContainText('경비 정산');
  await expect(page.locator('.private-gate').getByRole('button', { name: 'GitHub로 로그인', exact: true })).toBeVisible();
  await expect(page.locator('.expense-table')).toHaveCount(0);
  await expect(page.locator('.header-date')).not.toContainText('두 사람, 세 개의 섬');
  await expect(page.locator('.sidebar-note')).not.toContainText('우리만의 속도로');
  await page.goto('./#view=bookings&date=2026-12-23');
  await expect(page.getByRole('heading', { name: '예약확인서·첨부자료', exact: true })).toBeVisible();
  await expect(page.locator('.document-library')).toHaveCount(0);
  expect(privateRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-private-login.png`, fullPage: true });
});

test('a signed-in account rejected by the server cannot load expenses or documents', async ({ page }) => {
  await mockPrivateSession(page, false);
  let reads = 0;
  await page.route('**/rest/v1/travel_expenses**', route => { reads++; return route.fulfill({ status: 403 }); });
  await page.goto('./#view=expenses&date=2026-12-23');
  await expect(page.locator('.private-gate')).toContainText('접근 권한이 없습니다');
  await expect(page.locator('.expense-table')).toHaveCount(0);
  expect(reads).toBe(0);
});

test('owner edits cells directly, serializes rapid changes and persists add/delete/undo', async ({ page }, testInfo) => {
  await mockPrivateSession(page, true);
  let rows = [{ id: '00000000-0000-4000-8000-000000000002', category: '교통', subcategory: '테스트 교통', vendor: '테스트 업체', direction: '지출', amount: 100 as number | null, currency: 'KRW', payer: '결제자 A', payment_method: '카드', payment_date: '2026-12-22', status: '결제 완료', memo: '', sort_order: 1, revision: 1, deleted_at: null as string | null }];
  const patches: Record<string, unknown>[] = [];
  let inFlight = 0, maximum = 0;
  await page.route('**/rest/v1/travel_expenses**', async route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() === 'GET') return route.fulfill({ json: url.searchParams.has('id') ? rows.find(row => `eq.${row.id}` === url.searchParams.get('id')) : rows.filter(row => !row.deleted_at) });
    const payload = request.postDataJSON();
    if (request.method() === 'POST') { const row = { ...rows[0], ...payload, revision: 1, deleted_at: null }; rows.push(row); return route.fulfill({ json: row }); }
    const row = rows.find(row => `eq.${row.id}` === url.searchParams.get('id'))!;
    if (`eq.${row.revision}` !== url.searchParams.get('revision')) return route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'Conflict' } });
    patches.push(payload); inFlight++; maximum = Math.max(maximum, inFlight);
    if (patches.length === 1) await new Promise(resolve => setTimeout(resolve, 500));
    Object.assign(row, payload, { revision: row.revision + 1 });
    inFlight--; return route.fulfill({ json: { ...row } });
  });
  await page.goto('./#view=expenses&date=2026-12-23');
  const first = page.locator('.expense-table tbody tr').first();
  await expect(first.getByLabel('소분류 / 항목명', { exact: true })).toHaveValue('테스트 교통');
  await expect(page.getByRole('button', { name: '수정 테스트 교통', exact: true })).toHaveCount(0);
  await first.getByLabel('금액', { exact: true }).fill('250');
  await first.getByLabel('통화', { exact: true }).selectOption('USD');
  await expect.poll(() => patches.length).toBe(1);
  await first.getByLabel('결제자', { exact: true }).selectOption('__custom__');
  await first.getByLabel('새 결제자', { exact: true }).fill('결제자 B');
  await first.getByLabel('새 결제자', { exact: true }).press('Enter');
  await first.getByLabel('비고', { exact: true }).fill('빠른 연속 입력');
  await first.getByLabel('비고', { exact: true }).press('Tab');
  await expect(page.locator('.grid-savebar')).toContainText('모든 변경 저장 완료');
  expect(maximum).toBe(1);
  expect(rows[0]).toMatchObject({ amount: 250, currency: 'USD', payer: '결제자 B', memo: '빠른 연속 입력' });
  await expect(first.locator('.converted-amount')).toContainText('(약 ₩375,000)');
  await first.getByLabel('금액', { exact: true }).fill('999');
  await first.getByLabel('금액', { exact: true }).press('Escape');
  await expect(first.getByLabel('금액', { exact: true })).toHaveValue('250');
  await expect(page.locator('.grid-savebar')).toContainText('모든 변경 저장 완료');
  await page.reload();
  await expect(first.getByLabel('결제자', { exact: true })).toHaveValue('결제자 B');
  await page.getByRole('button', { name: '경비 추가', exact: true }).click();
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(2);
  const added = page.locator('.expense-table tbody tr').last();
  await added.getByLabel('소분류 / 항목명', { exact: true }).fill('추가 지출');
  await added.getByLabel('금액', { exact: true }).fill('12.50');
  await added.getByLabel('통화', { exact: true }).selectOption('USD');
  await added.getByLabel('금액', { exact: true }).press('Enter');
  await expect(page.locator('.grid-savebar')).toContainText('모든 변경 저장 완료');
  expect(rows[1].amount).toBe(12.5);
  expect(rows[1].currency).toBe('USD');
  await expect(added.getByLabel('결제구분', { exact: true })).toHaveValue('확인 필요');
  await added.getByLabel('결제구분', { exact: true }).selectOption('현지 현금');
  await expect(page.locator('.grid-savebar')).toContainText('모든 변경 저장 완료');
  await expect(page.locator('.payment-total.cash')).toContainText('US$12.50');
  await page.reload();
  await expect(added.getByLabel('결제구분', { exact: true })).toHaveValue('현지 현금');
  await page.getByLabel('결제구분 필터', { exact: true }).selectOption('현지 현금');
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.expense-table').getByLabel('소분류 / 항목명', { exact: true })).toHaveValue('추가 지출');
  await page.getByLabel('결제구분 필터', { exact: true }).selectOption('전체');
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(2);
  await expect(added.locator('.converted-amount')).toContainText('(약 ₩18,750)');
  await page.getByRole('button', { name: '삭제 추가 지출', exact: true }).click();
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: '삭제 취소', exact: true }).click();
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-inline-expenses.png`, fullPage: true });
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.getByRole('button', { name: 'GitHub로 로그인', exact: true })).toBeVisible();
  await expect(page.locator('.expense-table')).toHaveCount(0);
});

test('autosave confirms a lost response and protects conflicting and invalid edits', async ({ page }) => {
  await mockPrivateSession(page, true);
  const row = { id: 'save-test', category: '교통', subcategory: '저장 테스트', vendor: '업체', direction: '지출', amount: 100, currency: 'KRW', payer: 'A', payment_method: '', payment_date: '', status: '예정', memo: '', sort_order: 1, revision: 1, deleted_at: null };
  let writes = 0;
  let deletedOnServer = false;
  const patches: Record<string, unknown>[] = [];
  await page.route('**/rest/v1/travel_expenses**', async route => {
    const request = route.request(), url = new URL(request.url());
    if (request.method() === 'GET') {
      if (deletedOnServer && url.searchParams.has('id')) return route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'No rows' } });
      return route.fulfill({ json: url.searchParams.has('id') ? { ...row } : deletedOnServer ? [] : [{ ...row }] });
    }
    if (deletedOnServer) return route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'Deleted' } });
    if (`eq.${row.revision}` !== url.searchParams.get('revision')) return route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'Conflict' } });
    writes++; patches.push(request.postDataJSON()); Object.assign(row, request.postDataJSON(), { revision: row.revision + 1 });
    if (writes === 1) return route.abort('failed');
    return route.fulfill({ json: { ...row } });
  });
  await page.goto('./#view=expenses&date=2026-12-23');
  const entry = page.locator('.expense-table tbody tr').first();
  await entry.getByLabel('금액', { exact: true }).fill('300');
  await entry.getByLabel('금액', { exact: true }).press('Enter');
  await expect(entry.locator('.row-save-state')).toHaveText('저장 실패');
  await expect(entry.getByLabel('금액', { exact: true })).toHaveValue('300');
  await entry.getByRole('button', { name: '다시 저장', exact: true }).click();
  await expect(entry.locator('.row-save-state')).toHaveText('저장 완료');
  expect(writes).toBe(1);
  row.memo = '다른 기기 메모'; row.revision++;
  await entry.getByLabel('금액', { exact: true }).fill('400');
  await entry.getByLabel('금액', { exact: true }).press('Enter');
  await expect(entry.locator('.row-save-state')).toHaveText('변경 충돌');
  await expect(entry.getByLabel('금액', { exact: true })).toHaveValue('400');
  await entry.getByRole('button', { name: '최신값 불러오기', exact: true }).click();
  await expect(entry.getByLabel('금액', { exact: true })).toHaveValue('300');
  await expect(entry.getByLabel('비고', { exact: true })).toHaveValue('다른 기기 메모');
  await entry.getByLabel('금액', { exact: true }).fill('400');
  await entry.getByLabel('금액', { exact: true }).press('Enter');
  await expect(entry.locator('.row-save-state')).toHaveText('저장 완료');
  expect(patches.at(-1)).toEqual({ amount: 400 });
  expect(row.memo).toBe('다른 기기 메모');
  await entry.getByLabel('금액', { exact: true }).fill('-1');
  await entry.getByLabel('금액', { exact: true }).press('Enter');
  await expect(entry.locator('.row-save-state')).toHaveText('입력 확인');
  expect(row.amount).toBe(400);
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.getByText('경비 변경이 아직 저장되지 않았습니다. 저장 완료를 확인한 뒤 로그아웃해주세요.', { exact: true })).toBeVisible();
  await entry.getByRole('button', { name: '최신값 불러오기', exact: true }).click();
  await expect(entry.getByLabel('금액', { exact: true })).toHaveValue('400');
  deletedOnServer = true;
  await entry.getByLabel('비고', { exact: true }).fill('삭제된 행에 대한 입력');
  await entry.getByLabel('비고', { exact: true }).press('Enter');
  await expect(entry.locator('.row-save-state')).toHaveText('변경 충돌');
  await entry.getByRole('button', { name: '최신값 불러오기', exact: true }).click();
  await expect(page.locator('.expense-table tbody tr')).toHaveCount(0);
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.getByRole('button', { name: 'GitHub로 로그인', exact: true })).toBeVisible();
});

test('leaving the expense tab flushes pending cell edits', async ({ page }) => {
  await mockPrivateSession(page, true);
  const row = { id: 'navigation-save', category: '교통', subcategory: '이동 저장', vendor: '', direction: '지출', amount: 100, currency: 'KRW', payer: '', payment_method: '', payment_date: '', status: '예정', memo: '', sort_order: 1, revision: 1, deleted_at: null };
  await page.route('**/rest/v1/travel_expenses**', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: [{ ...row }] });
    await new Promise(resolve => setTimeout(resolve, 200));
    Object.assign(row, route.request().postDataJSON(), { revision: row.revision + 1 });
    return route.fulfill({ json: { ...row } });
  });
  await page.goto('./#view=expenses&date=2026-12-23');
  await page.locator('.expense-table').getByLabel('비고', { exact: true }).fill('메뉴 이동 직전 입력');
  await page.locator('nav a').filter({ hasText: '날짜별 일정' }).click();
  await expect.poll(() => row.memo).toBe('메뉴 이동 직전 입력');
  await page.locator('nav a').filter({ hasText: '경비 정산' }).click();
  await expect(page.locator('.expense-table').getByLabel('비고', { exact: true })).toHaveValue('메뉴 이동 직전 입력');
});

test('owner can upload and view a protected image, then logout clears the viewer', async ({ page }) => {
  await mockPrivateSession(page, true);
  let documents: Record<string, unknown>[] = [];
  await page.route('**/rest/v1/travel_documents**', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: documents });
    const document = { ...route.request().postDataJSON(), id: 'test-document' };
    documents.push(document); return route.fulfill({ json: document });
  });
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/1kAAAAASUVORK5CYII=', 'base64');
  await page.route('**/storage/v1/object/**', route => route.request().method() === 'POST' ? route.fulfill({ json: { Key: 'test-file' } }) : route.fulfill({ body: png, contentType: 'image/png' }));
  await page.goto('./#view=bookings&date=2026-12-23');
  await page.locator('.document-upload summary').click();
  await page.locator('.document-upload select').selectOption('flight:AS1096');
  await page.locator('.document-upload input:not([type="file"])').fill('테스트 예약확인서');
  await page.locator('input[type="file"]').setInputFiles({ name: 'confirmation.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: '비공개 자료 저장', exact: true }).click();
  await expect(page.locator('.document-card')).toContainText('테스트 예약확인서');
  await page.getByRole('button', { name: '자료 열기 테스트 예약확인서', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('src', /^blob:/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.locator('.document-library')).toHaveCount(0);
});


test('USD remains visible during quote failure and refresh updates parenthesized KRW amounts and budget', async ({ page }, testInfo) => {
  await mockPrivateSession(page, true);
  let unavailable = true;
  let rate = 1600;
  await page.route('https://open.er-api.com/v6/latest/USD', route => unavailable ? route.fulfill({ status: 503, json: { result: 'error' } }) : route.fulfill({ json: { result: 'success', base_code: 'USD', rates: { KRW: rate }, time_last_update_unix: Math.floor(Date.now() / 1000), time_next_update_unix: Math.floor(Date.now() / 1000) + 86400 } }));
  await page.route('**/rest/v1/travel_expenses**', route => route.fulfill({ json: [{ id: 'fx-test', category: '렌터카', subcategory: 'USD 예산 테스트', vendor: '', direction: '지출', amount: 20.25, currency: 'USD', payer: '', payment_method: '', payment_date: '', status: '예정', memo: '', sort_order: 1, revision: 1, deleted_at: null }] }));
  await page.goto('./#view=expenses&date=2026-12-23');
  await expect(page.locator('.exchange-rate-info')).toContainText('환율을 갱신하지 못했습니다');
  await expect(page.locator('.expense-table').getByLabel('금액', { exact: true })).toHaveValue('20.25');
  await expect(page.locator('.expense-table').getByLabel('통화', { exact: true })).toHaveValue('USD');
  await expect(page.locator('.expense-table .amount')).toContainText('(환율 확인 필요)');
  await expect(page.locator('.total-budget')).toContainText('환율 확인 필요');
  unavailable = false;
  await page.getByRole('button', { name: '환율 새로고침', exact: true }).click();
  await expect(page.locator('.expense-table .amount')).toContainText('(약 ₩32,400)');
  await expect(page.locator('.total-budget')).toContainText('약 ₩32,400');
  await expect(page.locator('.exchange-rate-info')).toContainText('1 USD = 1,600원');
  await expect(page.locator('.exchange-rate-info')).toContainText('한국시간 기준');
  rate = 1500;
  await page.getByRole('button', { name: '환율 새로고침', exact: true }).click();
  await expect(page.locator('.expense-table .amount')).toContainText('(약 ₩30,375)');
  await expect(page.locator('.expense-summary')).toContainText('US$20.25');
  await page.reload();
  await expect(page.locator('.expense-table .amount')).toContainText('(약 ₩30,375)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-usd-conversion.png`, fullPage: true });
  unavailable = true;
  await page.getByRole('button', { name: '환율 새로고침', exact: true }).click();
  await expect(page.locator('.exchange-rate-info')).toContainText('표시된 기준 시각의 환율로 계산합니다');
  await expect(page.locator('.expense-table .amount')).toContainText('(약 ₩30,375)');
});

