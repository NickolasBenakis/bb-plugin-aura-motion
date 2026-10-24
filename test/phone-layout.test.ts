import test from "node:test";
import assert from "node:assert/strict";
import { PHONE_LAYOUT, PHONE_MEDIA } from "../lib/background.ts";

test("phone rules apply only on touch phones, never in a narrow desktop window", () => {
  assert.equal(PHONE_MEDIA, "(max-width:767px) and (pointer:coarse)");
  const body = PHONE_LAYOUT.trim();
  assert.ok(body.startsWith(`@media ${PHONE_MEDIA} {`) && body.endsWith("}"));
  // Every rule sits inside the one media block.
  assert.equal(body.match(/@media/g)?.length, 1);
});

test("New thread recents and project row get an opaque enough card on phones", () => {
  for (const target of [/\[data-root-compose-mobile-recents\] \{[^}]*/, /\[data-app-composer-role="primary"\] > :last-child \{[^}]*/]) {
    const rule = PHONE_LAYOUT.match(target)?.[0] ?? "";
    const fill = Number(rule.match(/var\(--background\) (\d+)%/)?.[1]);
    assert.ok(fill >= 90, `fill ${fill}% keeps text readable over bright video`);
  }
});

test("Sheer chats on phones use at least Glass's fill", () => {
  for (const [selector, percent] of [[/^\s*\.aura-motion-capy-sheet\[data-surface="sheer"\] \{[^}]*/m, 66], [/\.dark \.aura-motion-capy-sheet\[data-surface="sheer"\] \{[^}]*/, 60]] as const) {
    const fill = Number(PHONE_LAYOUT.match(selector)?.[0].match(/var\(--background\) (\d+)%/)?.[1]);
    assert.ok(fill >= percent, `sheer fill ${fill}% on phones`);
  }
});
