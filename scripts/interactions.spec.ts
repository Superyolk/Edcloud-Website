/**
 * Behavioural checks for the app (no reference involved): nav transparency, service tabs, mobile
 * menu, form validation, focus rings, hero video, and Lighthouse accessibility.
 */
import { test, expect, type Page } from '@playwright/test';

const APP = process.env.APP_URL ?? 'http://localhost:3000';

async function ready(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

test.describe('home header', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('is transparent over the hero and solid white after scrolling', async ({ page }) => {
    await ready(page, APP + '/');
    const header = page.locator('header');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
});

test.describe('service tabs', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('hovering the second title switches the detail panel', async ({ page }) => {
    await ready(page, APP + '/');
    const tabs = page.locator('button[aria-pressed]');
    await expect(tabs).toHaveCount(3);
    await tabs.nth(1).hover();
    await expect(tabs.nth(1)).toHaveAttribute('aria-pressed', 'true');
    const lead = page.locator('button[aria-pressed]').locator('xpath=ancestor::ol[1]/following-sibling::div[1]/p[1]');
    await expect(lead).toHaveText(/^Don't just adopt the gold standard\./);
    await expect(tabs.nth(0)).toHaveCSS('color', 'rgb(122, 132, 148)');
    await expect(tabs.nth(1)).toHaveCSS('color', 'rgb(27, 36, 49)');
  });
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Menu toggles a five-link list and reads Close', async ({ page }) => {
    await ready(page, APP + '/');
    const button = page.locator('header button[aria-controls="mobile-menu"]');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Menu');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(button).toHaveText('Close');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu li a')).toHaveCount(5);
    // The open menu turns the home header solid.
    await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await button.click();
    await expect(page.locator('#mobile-menu')).toHaveCount(0);
  });
});

test.describe('contact form', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('empty required fields block submission', async ({ page }) => {
    await ready(page, APP + '/');
    await page.evaluate(() => {
      (window as unknown as { __submitted: boolean }).__submitted = false;
      document.querySelector('form:has(#c-first)')?.addEventListener('submit', () => {
        (window as unknown as { __submitted: boolean }).__submitted = true;
      });
    });
    await page.locator('form:has(#c-first) button[type=submit]').click();
    expect(await page.evaluate(() => (window as unknown as { __submitted: boolean }).__submitted)).toBe(false);
    expect(await page.evaluate(() => (document.querySelector('form:has(#c-first)') as HTMLFormElement).checkValidity())).toBe(false);
    expect(await page.evaluate(() => (document.querySelector('#c-first') as HTMLInputElement).validity.valueMissing)).toBe(true);
    expect(page.url()).toBe(APP + '/');
  });

  test('every focusable element shows the 2px green outline or ring', async ({ page }) => {
    await ready(page, APP + '/');
    const bad: string[] = [];
    let stops = 0;
    for (let i = 0; i < 300; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null; // focus wrapped back to the document
        if (el.dataset.focusVisited) return 'cycled';
        el.dataset.focusVisited = '1';
        const cs = getComputedStyle(el);
        const key = `${el.tagName}#${el.id} "${(el.textContent ?? '').trim().slice(0, 24)}"`;
        const outline = cs.outlineStyle !== 'none' && cs.outlineWidth === '2px' && cs.outlineColor === 'rgb(23, 145, 107)';
        const ring = cs.boxShadow.includes('rgba(23, 145, 107, 0.25)') && cs.borderColor === 'rgb(23, 145, 107)';
        return { key, ok: outline || ring, detail: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} / ${cs.boxShadow}` };
      });
      if (!info || info === 'cycled') break;
      stops++;
      if (!info.ok) bad.push(`${info.key}: ${info.detail}`);
    }
    console.log(`focus stops checked: ${stops}`);
    expect(stops).toBeGreaterThan(20);
    expect(bad).toEqual([]);
  });
});

test.describe('hero video', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('plays when motion is allowed', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await ready(page, APP + '/');
    const video = page.locator('video');
    await expect(video).toHaveCount(1);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2), { timeout: 60_000 }).toBe(true);
    expect(await video.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBeCloseTo(0.85, 2);
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop && v.hasAttribute('playsinline'))).toBe(true);
  });

  test('is absent under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ready(page, APP + '/');
    await page.waitForTimeout(500);
    await expect(page.locator('video')).toHaveCount(0);
    await expect(page.locator('main img').first()).toBeVisible(); // poster stays
  });
});

test.describe('lighthouse accessibility', () => {
  test.setTimeout(300_000);
  test.skip(process.platform !== 'win32' && !process.env.CHROME_PATH, 'needs a full Chrome (set CHROME_PATH)');

  for (const route of ['/', '/about', '/services-and-results']) {
    test(`accessibility >= 95 on ${route}`, async () => {
      const { default: lighthouse } = await import('lighthouse');
      const chromeLauncher = await import('chrome-launcher');
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'], chromePath: process.env.CHROME_PATH });
      try {
        const result = await lighthouse(APP + route, { port: chrome.port, onlyCategories: ['accessibility'], output: 'json', logLevel: 'error' });
        const score = (result?.lhr.categories.accessibility.score ?? 0) * 100;
        const failing = Object.values(result?.lhr.audits ?? {})
          .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative')
          .map((a) => `${a.id}: ${a.title}`);
        console.log(`Lighthouse accessibility ${route}: ${score}${failing.length ? ' — not perfect: ' + failing.join('; ') : ''}`);
        expect(score).toBeGreaterThanOrEqual(95);
      } finally {
        // chrome-launcher's temp-profile cleanup can throw EPERM on Windows; the score is already captured.
        try {
          await chrome.kill();
        } catch {
          /* ignore */
        }
      }
    });
  }
});
