import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readingSurface, READING_SURFACE } from "../lib/background.ts";
import { CAPY_CSS, mountCapyEffect, SHEET_INSET, sheetBox } from "../lib/capy-effect.ts";
import { CHAT_SURFACES, defaults, settingsSchema } from "../lib/model.ts";

test("legacy settings without a chat surface keep the solid reading column", () => {
  const { chatSurface, ...legacy } = defaults;
  assert.equal(chatSurface, "solid");
  assert.equal(settingsSchema.parse(legacy).chatSurface, "solid");
  assert.equal(READING_SURFACE, readingSurface("solid"));
});

test("solid paints the column opaque; translucent modes clear it and blur under the composer", () => {
  const solid = readingSurface("solid");
  assert.match(solid, /\.mx-auto[^{]*\{ background-color:var\(--background\); \}/);
  assert.doesNotMatch(solid, /backdrop-filter|mask-image/);
  for (const surface of CHAT_SURFACES.filter(value => value !== "solid")) {
    const css = readingSurface(surface);
    assert.match(css, /\.mx-auto, [^{]*\.mx-auto \{ background-color:transparent; \}/);
    assert.match(css, /\.mx-auto::before \{[^}]*backdrop-filter:blur\(/);
    // Only the pseudo-element is filtered, or fixed menus in the composer would anchor to the column.
    // Only pseudo-elements and the composer form (whose menus use a portal) are
    // filtered, or fixed menus inside the column would anchor to it.
    const filtered = css.replace(/::before \{[^}]*\}/g, "").replace(/form\[data-promptbox\][^{]*\{[^}]*\}/g, "");
    assert.doesNotMatch(filtered, /backdrop-filter/);
    assert.match(css, /header:has\([^)]*\) \{ background:transparent;/);
  }
});

test("the glass sheet shows only in conversations with a translucent surface", () => {
  const dom = new JSDOM("<!doctype html><div id=thread-detail-timeline-panel></div><div id=root-compose-main-panel></div>");
  const previous = { document: globalThis.document, MutationObserver: globalThis.MutationObserver };
  Object.assign(globalThis, { document: dom.window.document, MutationObserver: dom.window.MutationObserver });
  try {
    const chat = dom.window.document.getElementById("thread-detail-timeline-panel")!;
    const compose = dom.window.document.getElementById("root-compose-main-panel")!;
    const glass = { ...defaults, effect: "none" as const, chatSurface: "glass" as const };
    const chatEffect = mountCapyEffect(chat, glass, null);
    const composeEffect = mountCapyEffect(compose, glass, null);
    const sheet = (parent: HTMLElement) => parent.querySelector<HTMLElement>(".aura-motion-capy-sheet")!;
    assert.equal(sheet(chat).dataset.surface, "glass");
    assert.equal(sheet(compose).dataset.surface, undefined);
    chatEffect.update({ ...glass, chatSurface: "solid" }, null);
    assert.equal(sheet(chat).dataset.surface, undefined);
    chatEffect.dispose(); composeEffect.dispose();
    assert.equal(chat.querySelector(".aura-motion-capy-sheet"), null);
    assert.match(CAPY_CSS, /prefers-reduced-transparency/);
  } finally { Object.assign(globalThis, previous); }
});

test("the sheet follows the column on wide panels and keeps an inset on every narrow device width", () => {
  // Panel widths for phones, tablets, laptops and large desktops; BB centers a column of at most 760px.
  for (const width of [320, 360, 390, 414, 600, 768, 820, 1024, 1120, 1280, 1440, 1920, 2560]) {
    const panel = { left: 0, right: width, top: 0 };
    const columnWidth = Math.min(760, width);
    const column = { left: (width - columnWidth) / 2, right: (width + columnWidth) / 2, top: -4000 };
    const box = sheetBox(panel, column, { left: 0, right: width, top: 48 });
    assert.ok(box.left >= SHEET_INSET, `left inset at ${width}px`);
    assert.ok(box.left + box.width <= width - SHEET_INSET, `right inset at ${width}px`);
    assert.equal(box.top, 48 + SHEET_INSET, `clears the header at ${width}px`);
    if (width >= 760 + 2 * SHEET_INSET) assert.deepEqual([box.left, box.width], [column.left, columnWidth], `matches the column at ${width}px`);
  }
  // Panels offset by a sidebar are measured relative to the panel, and a missing scroller keeps the CSS top.
  assert.deepEqual(sheetBox({ left: 320, right: 1440, top: 0 }, { left: 500, right: 1260, top: 0 }, null), { left: 180, width: 760, top: null });
});

test("narrow panels widen the text padding so messages keep room from the glass edge", () => {
  for (const surface of ["glass", "sheer"] as const) assert.match(readingSurface(surface), /@container page \(max-width: 780px\) \{[^}]*padding-inline:26px/);
  assert.doesNotMatch(readingSurface("solid"), /@container page/);
});
