// Opt-in layout check for the chat glass sheet across device sizes and themes.
// Read-only: it opens an existing thread and never changes Aura Motion settings.
// BB_THREAD_ID=thr_… BB_SCREENSHOT_DIR=… [BB_OTHER_THREAD_ID=thr_…] node test/responsive.browser.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.BB_BASE_URL || 'http://127.0.0.1:38886';
const thread = process.env.BB_THREAD_ID, other = process.env.BB_OTHER_THREAD_ID;
const shots = process.env.BB_SCREENSHOT_DIR || process.env.BB_THREAD_STORAGE;
if (!thread || !shots) throw new Error('Set BB_THREAD_ID and BB_SCREENSHOT_DIR.');
await mkdir(shots, { recursive: true });
const SIZES = [['phone-se', 320, 568], ['phone', 390, 844], ['tablet', 768, 1024], ['tablet-landscape', 1024, 768], ['laptop', 1280, 800], ['desktop', 1440, 900], ['full-hd', 1920, 1080], ['qhd', 2560, 1440]];
const INSET = 10, TOLERANCE = 1;
const browser = await chromium.launch({ headless: true, ...(process.env.BB_CHROMIUM_PATH ? { executablePath: process.env.BB_CHROMIUM_PATH } : {}), args: ['--enable-unsafe-swiftshader'] });

async function measure(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('#thread-detail-timeline-panel');
    const rect = element => { if (!element) return null; const { left, right, top, bottom, width } = element.getBoundingClientRect(); return { left, right, top, bottom, width }; };
    const sheet = panel?.querySelector('.aura-motion-capy-sheet');
    const header = panel?.querySelector('header');
    const viewport = { top: 0, bottom: innerHeight };
    const text = [...(panel?.querySelectorAll('.thread-scrollbar [data-markdown-preview] p') ?? [])].map(rect)
      .filter(box => box && box.width > 0 && box.bottom > viewport.top + 60 && box.top < viewport.bottom - 220);
    return {
      surface: sheet?.dataset.surface ?? null, panel: rect(panel), sheet: rect(sheet), header: rect(header),
      column: rect(panel?.querySelector('.thread-scrollbar > div > .mx-auto')), composer: rect(panel?.querySelector('form[data-promptbox]')), text,
      headerBackground: header ? getComputedStyle(header).backgroundColor : null,
      overflow: document.scrollingElement.scrollWidth - innerWidth,
    };
  });
}

function check(m, label) {
  assert.ok(m.surface === 'glass' || m.surface === 'sheer', `${label}: set Behind your messages to Glass or Sheer first (got ${m.surface})`);
  const { panel, sheet, column, composer } = m;
  assert.ok(sheet.left - panel.left >= INSET - TOLERANCE, `${label}: sheet keeps its left inset`);
  assert.ok(panel.right - sheet.right >= INSET - TOLERANCE, `${label}: sheet keeps its right inset`);
  assert.ok(sheet.top >= m.header.bottom + INSET - TOLERANCE, `${label}: sheet starts below the header`);
  assert.ok(panel.bottom - sheet.bottom >= INSET - TOLERANCE, `${label}: sheet keeps its bottom inset`);
  if (column.width <= panel.right - panel.left - 2 * INSET) {
    assert.ok(Math.abs(sheet.left - column.left) <= TOLERANCE && Math.abs(sheet.width - column.width) <= TOLERANCE, `${label}: sheet matches the column`);
  }
  for (const box of m.text) assert.ok(box.left >= sheet.left + 8 && box.right <= sheet.right - 8, `${label}: message text stays inside the glass`);
  assert.ok(composer.left >= sheet.left + 4 && composer.right <= sheet.right - 4, `${label}: composer sits inside the glass`);
  assert.equal(m.headerBackground, 'rgba(0, 0, 0, 0)', `${label}: header floats without a bar`);
  assert.ok(m.overflow <= 0, `${label}: no horizontal page scroll`);
}

try {
  for (const scheme of ['dark', 'light']) {
    for (const [name, width, height] of SIZES) {
      const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme });
      await page.goto(`${base}/threads/${thread}`);
      await page.waitForSelector('#thread-detail-timeline-panel .aura-motion-capy-sheet[data-surface]', { timeout: 20000 });
      await page.waitForTimeout(1200);
      check(await measure(page), `${name} ${width}×${height} ${scheme}`);
      await page.screenshot({ path: `${shots}/aura-motion-${scheme}-${name}.png` });
      await page.close();
    }
  }
  // The sheet must follow the column through live resizes and thread switches.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  await page.goto(`${base}/threads/${thread}`);
  await page.waitForSelector('#thread-detail-timeline-panel .aura-motion-capy-sheet[data-surface]');
  for (const [width, height] of [[390, 844], [1024, 768], [1920, 1080], [1440, 900]]) {
    await page.setViewportSize({ width, height }); await page.waitForTimeout(600);
    check(await measure(page), `live resize to ${width}px`);
  }
  if (other) {
    for (const id of [other, thread]) {
      await page.goto(`${base}/threads/${id}`); await page.waitForTimeout(1500);
      check(await measure(page), `after switching to ${id}`);
    }
  }
  console.log(`Responsive layout verified at ${SIZES.length} sizes in dark and light, through live resizes${other ? ' and thread switches' : ''}.`);
} finally { await browser.close(); }
