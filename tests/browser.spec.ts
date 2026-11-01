import { test, expect } from '@playwright/test';

// Test map behavior against local geographic data, independent of a public tile server.
test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
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
  for (const view of ['overview', 'bookings', 'prepare']) {
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
  await expect(page.locator('.stay-card')).toContainText('코나 에어비앤비');
  await page.getByRole('button', { name: /12. 21.*월요일/ }).click();
  await expect(page.locator('.stay-card')).toContainText('코나 에어비앤비');
  await expect(page.locator('.stay-card')).toContainText('카라이 와이키키');
  await page.goBack();
  await expect(page.locator('.date-button.selected')).toHaveText(/17/);
  await page.goto('./#view=daily&date=2026-12-25');
  await expect(page.locator('.stay-card')).toContainText('호텔 숙박 없음');
  await expect(page.locator('.flight-times')).toContainText('12. 26.');
});

test('checklist persists, filters work, and stored checks do not confirm itinerary', async ({ page }) => {
  await page.goto('./#view=prepare&date=2026-12-15');
  await expect(page.getByLabel('항공·숙소 예약', { exact: true })).toBeChecked();
  const checkbox = page.getByLabel('몰로키니 예약', { exact: true });
  await checkbox.check();
  await page.reload();
  await expect(checkbox).toBeChecked();
  await page.getByRole('button', { name: /남은 준비/ }).click();
  await expect(checkbox).toHaveCount(0);
  await page.getByRole('button', { name: /^완료/ }).click();
  await expect(checkbox).toBeChecked();
  await page.goto('./#view=daily&date=2026-12-15');
  await expect(page.locator('.timeline > li').first().locator('.badge')).toHaveText('계획');
});

test('keyboard access, touch targets, map links and flight chronology', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-12');
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
  await expect(page.getByRole('alert')).toContainText('저장소');
  await page.getByLabel('몰로키니 예약', { exact: true }).check();
  await expect(page.getByLabel('몰로키니 예약', { exact: true })).toBeChecked();
});

test('skip link preserves selected day and all status labels meet 4.5:1 contrast', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-24');
  await page.keyboard.press('Tab');
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

test('map changes routes and dates, and unknown lodging never gets a marker', async ({ page }) => {
  await page.goto('./#view=daily&date=2026-12-17');
  await page.locator('.map-filters button').filter({ hasText: '2. 비행기' }).click();
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  await expect(page.locator('.map-destinations')).toContainText('OGG');
  await expect(page.locator('.map-destinations')).not.toContainText('그랜드');
  await page.getByRole('button', { name: /12. 18.*금요일/ }).click();
  await expect(page.locator('.map-filters button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.destination-marker')).toHaveCount(2);
  await expect(page.locator('.destination-marker[title*="코나 에어비앤비"]')).toHaveCount(0);
  await page.locator('.map-destinations button').filter({ hasText: '코나 에어비앤비' }).click();
  await expect(page.locator('.map-selection')).toContainText('정확한 숙소 위치 미확인');
  await page.goto('./#view=daily&date=2026-12-12');
  await expect(page.locator('.destination-marker[title*="ICN"]')).toHaveCount(0);
  await page.getByRole('button', { name: '한국까지 보기' }).click();
  await expect(page.locator('.destination-marker[title*="ICN"]')).toHaveCount(1);
  await page.getByRole('button', { name: '하와이만 보기' }).click();
  await expect(page.locator('.destination-marker[title*="ICN"]')).toHaveCount(0);
});
