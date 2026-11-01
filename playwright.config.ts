import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'browser.spec.ts', fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173/honeymoon/', channel: process.env.CI ? undefined : 'chrome', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mobile-seoul', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'Asia/Seoul' } },
    { name: 'desktop-honolulu', use: { viewport: { width: 1440, height: 1000 }, timezoneId: 'Pacific/Honolulu' } },
  ],
  webServer: { command: 'node scripts/serve-built.mjs', url: 'http://127.0.0.1:4173/honeymoon/', reuseExistingServer: !process.env.CI },
});
