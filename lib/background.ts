import { imageUrl, snapshotSchema, type ChatSurface, type Snapshot } from "./model.ts";
import { CAPY_CSS, mountCapyEffect, type CapyEffect } from "./capy-effect.ts";

export const LOCAL_CHANGE = "bb:aura-motion:changed";
export const TARGETS = ':is([id="thread-detail-timeline-panel"], [id="root-compose-main-panel"])';
export const NEW_THREAD_TARGET = '[id="root-compose-main-panel"]';
export function targetsFor(snapshot: Snapshot): string { return snapshot.settings.newThreadOnly ? NEW_THREAD_TARGET : TARGETS; }
export function backgroundRules(selector: string): string { return `${selector}{position:relative;isolation:isolate;}`; }

// Center only the full New thread compose layout. Auto margins collapse when
// the draft grows taller than the viewport, keeping it reachable by scrolling.
export const COMPOSE_CENTER = `
${NEW_THREAD_TARGET} [class~="@container/page"]:has(> .mx-auto) {
  display:flex; flex-direction:column;
}
${NEW_THREAD_TARGET} [class~="@container/page"] > .mx-auto {
  margin-block:auto; padding-block:28px;
}
${NEW_THREAD_TARGET} [data-testid="root-compose-compact-home"] {
  display:flex; flex-direction:column; overflow-y:auto;
}
${NEW_THREAD_TARGET} [data-testid="root-compose-compact-composer"] {
  position:relative; inset:auto; order:-1; flex:none;
  display:flex; flex-direction:column; justify-content:center;
  min-height:min(45dvh,440px); padding-block:28px;
}
${NEW_THREAD_TARGET} [data-testid="root-compose-compact-scroll-viewport"] {
  position:relative; top:auto !important; bottom:auto; flex:none; overflow:visible;
}
${NEW_THREAD_TARGET} [data-testid="root-compose-compact-scroll-content"] {
  min-height:0; justify-content:flex-start;
}
${NEW_THREAD_TARGET} :is([data-testid="root-compose-compact-recents-offset"],[data-testid="root-compose-compact-bottom-spacer"],[data-testid="root-compose-compact-fade"]) {
  display:none;
}
`;
export const COMPOSE_LAYOUT = `${COMPOSE_CENTER}
@media (min-width:768px) {
  ${NEW_THREAD_TARGET} [data-app-composer-role="primary"] > :last-child {
    position:relative; z-index:0; margin-top:8px; padding:5px 9px;
    border-radius:11px;
    -webkit-backdrop-filter:blur(14px) saturate(.86);
    backdrop-filter:blur(14px) saturate(.86);
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > :first-child {
    display:flex; align-items:center; gap:12px; margin-bottom:8px; padding:0 2px;
    background-color:transparent;
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > :first-child::after {
    content:""; height:1px; flex:1;
    background:linear-gradient(to right,color-mix(in oklab,var(--foreground) 22%,transparent),transparent);
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] h2 {
    color:color-mix(in oklab,var(--foreground) 76%,transparent);
    font-size:.75rem; line-height:1; font-weight:600;
    letter-spacing:.02em; text-transform:none;
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] [data-overflow-fade] {
    display:none;
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li,
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > [role="status"] {
    transition:background-color 140ms ease,border-color 140ms ease,box-shadow 140ms ease;
  }
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-app-composer-role="primary"] > :last-child {
    border:1px solid color-mix(in oklab,var(--border) 74%,transparent);
    background:color-mix(in oklab,var(--background) 94%,transparent);
    box-shadow:0 5px 18px color-mix(in oklab,var(--foreground) 7%,transparent);
  }
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] {
    padding:12px 10px 8px;
    border:1px solid color-mix(in oklab,var(--border) 72%,transparent);
    border-radius:16px;
    background:color-mix(in oklab,var(--background) 94%,transparent);
    box-shadow:0 10px 30px color-mix(in oklab,var(--foreground) 8%,transparent);
    -webkit-backdrop-filter:blur(16px) saturate(.88);
    backdrop-filter:blur(16px) saturate(.88);
  }
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li,
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > [role="status"] {
    border:0; background:transparent; box-shadow:none;
  }
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li + li {
    margin-top:0;
    border-top:1px solid color-mix(in oklab,var(--border) 58%,transparent);
  }
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li:hover,
  :root:not(.dark) ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li[class~="bg-surface-selected"] {
    background:color-mix(in oklab,var(--foreground) 5%,transparent);
  }
  .dark ${NEW_THREAD_TARGET} [data-app-composer-role="primary"] > :last-child {
    border:1px solid color-mix(in oklab,var(--border) 48%,transparent);
    background:color-mix(in oklab,var(--background) 46%,transparent);
    box-shadow:0 5px 18px color-mix(in oklab,var(--foreground) 5%,transparent);
  }
  .dark ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li,
  .dark ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > [role="status"] {
    border:1px solid color-mix(in oklab,var(--border) 40%,transparent);
    background:color-mix(in oklab,var(--background) 30%,transparent);
    box-shadow:0 3px 14px color-mix(in oklab,var(--foreground) 4%,transparent);
    -webkit-backdrop-filter:blur(10px) saturate(.84);
    backdrop-filter:blur(10px) saturate(.84);
  }
  .dark ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li + li {
    margin-top:4px;
  }
  .dark ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li:hover,
  .dark ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > ul > li[class~="bg-surface-selected"] {
    border-color:color-mix(in oklab,var(--border) 70%,transparent);
    background:color-mix(in oklab,var(--background) 54%,transparent);
  }
}
`;
// Phones: the same test BB uses for its touch sizing, so a narrow desktop
// window driven by a mouse keeps the desktop look.
export const PHONE_MEDIA = "(max-width:767px) and (pointer:coarse)";
// On a phone the content covers the whole wallpaper, so New thread's recents
// and project row get their own glass card instead of sitting on bare video,
// and BB's opaque band around the composer clears so the wallpaper reads as
// one picture. Sheer chats get Glass's fill: a bright frame behind a
// full-width column otherwise washes out muted text.
export const PHONE_LAYOUT = `
@media ${PHONE_MEDIA} {
  ${NEW_THREAD_TARGET} [data-testid="root-compose-compact-composer"] div.bg-background {
    background-color:transparent;
  }
  ${NEW_THREAD_TARGET} [data-app-composer-role="primary"] > :last-child {
    margin-top:8px; padding:4px 8px; border-radius:12px;
    border:1px solid color-mix(in oklab,var(--border) 60%,transparent);
    background:color-mix(in oklab,var(--background) 90%,transparent);
    -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px);
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] {
    margin-bottom:16px; padding:6px 6px 8px; border-radius:18px;
    border:1px solid color-mix(in oklab,var(--border) 60%,transparent);
    background:color-mix(in oklab,var(--background) 90%,transparent);
    box-shadow:0 10px 30px rgba(0,0,0,.25);
    -webkit-backdrop-filter:blur(20px) saturate(.9);
    backdrop-filter:blur(20px) saturate(.9);
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] > :first-child {
    position:static; padding-top:6px; background-color:transparent;
  }
  ${NEW_THREAD_TARGET} [data-root-compose-mobile-recents] [data-overflow-fade] { display:none; }
  .aura-motion-capy-sheet[data-surface="sheer"] {
    --aura-motion-sheet-fill:color-mix(in oklab,var(--background) 66%,transparent);
  }
  .dark .aura-motion-capy-sheet[data-surface="sheer"] {
    --aura-motion-sheet-fill:color-mix(in oklab,var(--background) 60%,transparent);
  }
}
`;
// Paint for the chat reading column. Solid hides the wallpaper behind text.
// Glass and Sheer leave the column clear: the capy layer draws a floating
// sheet behind it, and the composer gets Apple's scroll-edge blur.
export function readingSurface(surface: ChatSurface): string {
  const PANEL = '[id="thread-detail-timeline-panel"]';
  const COLUMN = `${PANEL} .thread-scrollbar > div > .mx-auto`;
  const FOOTER = `${PANEL} [data-scroll-footer] > .bg-background > .mx-auto`;
  const TABLE = `${PANEL} [data-markdown-preview] div:has(> table)`;
  const HEADER = `${PANEL} header:has(> [data-testid="app-page-header-content-row"])`;
  // The composer, and the question card BB shows in its place, which is only
  // 6% opaque because it expects the host's opaque footer behind it.
  const PROMPT = `${PANEL} :is(form[data-promptbox], [data-testid="user-question-banner"])`;
  const paint = surface === "solid"
    ? `${COLUMN}, ${FOOTER} { background-color:var(--background); }
${COLUMN} { box-shadow:0 0 0 1px var(--border); }
${PANEL} [data-markdown-preview] table,
${TABLE} { background-color:var(--background); }`
    : `${COLUMN}, ${FOOTER} { background-color:transparent; }
/* Messages fade out at the top edge of the sheet. The mask also makes the
   scroller the backdrop root, so the composer blur below sees only messages. */
${PANEL} .thread-scrollbar:has(> div > .mx-auto) {
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 28px);
  mask-image:linear-gradient(to bottom,transparent 0,#000 28px);
}
/* Messages fade and blur as they pass under the composer. Below the 32px fade
   the tint is solid: even 5% let bright text show beside the composer row.
   A pseudo-element carries both so fixed-position menus stay anchored. */
${FOOTER} { position:relative; isolation:isolate; }
${FOOTER}::before {
  content:""; position:absolute; inset:-32px 0 0; z-index:-1; pointer-events:none;
  background-color:var(--background);
  -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  -webkit-mask-image:linear-gradient(to bottom,transparent,#000 32px);
  mask-image:linear-gradient(to bottom,transparent,#000 32px);
}
${PANEL} [data-scroll-footer] > .bg-background:has(> .mx-auto) > [data-overflow-fade] { display:none; }
/* Once the column fills the panel, the sheet sits SHEET_INSET inside it, so
   widen the text padding to keep the same breathing room from the glass edge. */
@container page (max-width: 780px) {
  ${COLUMN}, ${FOOTER} { padding-inline:26px; }
}
${TABLE} { background-color:color-mix(in oklab,var(--background) 40%,transparent); }
/* The thread header floats over the wallpaper like a macOS toolbar: no bar or
   seam, just a soft scrim that keeps the title legible. */
${HEADER} { background:transparent; border-color:transparent; isolation:isolate; }
${HEADER}::before {
  content:""; position:absolute; inset:0 0 -20px; z-index:-1; pointer-events:none;
  background:linear-gradient(to bottom,color-mix(in oklab,var(--background) 58%,transparent),transparent);
}
/* The composer becomes a glass capsule with the sheet's lit rim. Its menus
   render in a portal outside the panel, so the filter cannot displace them. */
${PROMPT} {
  border-radius:18px; corner-shape:squircle;
  background-color:color-mix(in oklab,var(--background) 95%,transparent);
  border-color:rgba(255,255,255,.6);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.7), 0 1px 2px rgba(0,0,0,.05), 0 10px 30px rgba(0,0,0,.12);
  -webkit-backdrop-filter:blur(24px) saturate(1.4); backdrop-filter:blur(24px) saturate(1.4);
}
.dark ${PROMPT} {
  background-color:color-mix(in oklab,var(--background) 92%,transparent);
  border-color:rgba(255,255,255,.1);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12), 0 1px 2px rgba(0,0,0,.3), 0 12px 36px rgba(0,0,0,.4);
}
@media (prefers-reduced-transparency: reduce) {
  ${PROMPT}, .dark ${PROMPT} { background-color:var(--background); -webkit-backdrop-filter:none; backdrop-filter:none; }
}`;
  return `
${PANEL} .thread-scrollbar:has(> div > .mx-auto) {
  background-color:transparent;
}
/* Continue the wallpaper beside the sticky composer instead of covering
   the bottom of the whole pane with the host's full-width footer paint. */
${PANEL} [data-scroll-footer] > .bg-background:has(> .mx-auto) {
  background-color:transparent;
}
${PANEL} [data-scroll-footer] > .bg-background:has(> .mx-auto) > [data-overflow-fade] {
  left:50%; right:auto; width:min(760px,100%); transform:translateX(-50%);
}
/* BB intentionally lets wide Markdown tables extend beyond the text column.
   Paint the whole scrollable table surface, including its overflow area. */
${paint}
`;
}
export const READING_SURFACE = readingSurface("solid");

export function notifyChange(snapshot: Snapshot): void {
  window.dispatchEvent(new CustomEvent(LOCAL_CHANGE, { detail: snapshot }));
}

export function mountBackground(signal: AbortSignal): () => void {
  const style = document.createElement("style");
  style.dataset.auraMotion = "";
  document.head.append(style);
  let disposed = false;
  let requestId = 0;
  let lastCss = "";
  let current: Snapshot | null = null;
  const effects = new Map<HTMLElement, CapyEffect>();
  let pending = false;
  function reconcile(): void {
    pending = false;
    if (disposed) return;
    for (const [element, effect] of effects) {
      if (!element.isConnected || !current?.settings.enabled || !element.matches(targetsFor(current))) { effect.dispose(); effects.delete(element); }
    }
    if (!current?.settings.enabled) return;
    for (const element of document.querySelectorAll<HTMLElement>(targetsFor(current))) {
      const existing = effects.get(element);
      // BB can reuse the same panel element when navigating between a
      // conversation and New thread. Reapply its surface-specific dimming.
      if (existing) existing.update(current.settings, imageUrl(current.image));
      else effects.set(element, mountCapyEffect(element, current.settings, imageUrl(current.image)));
    }
  }
  const observer = new MutationObserver(records => {
    const relevant = records.some(record => record.type === "attributes"
      ? record.target instanceof HTMLElement && (effects.has(record.target) || record.target.matches(TARGETS))
      : [...record.addedNodes, ...record.removedNodes].some(node =>
      node instanceof Element && (node.matches(TARGETS) || node.querySelector(TARGETS) !== null)));
    if (relevant && !pending) { pending = true; queueMicrotask(reconcile); }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["id"] });
  const controller = new AbortController();
  function apply(snapshot: Snapshot): void {
    current = snapshot;
    const target = targetsFor(snapshot);
    const css = snapshot.settings.enabled ? `${backgroundRules(target)}\n${CAPY_CSS}\n${COMPOSE_LAYOUT}\n${PHONE_LAYOUT}\n${snapshot.settings.newThreadOnly ? "" : readingSurface(snapshot.settings.chatSurface)}` : COMPOSE_CENTER;
    if (css !== lastCss) { style.textContent = css; lastCss = css; }
    reconcile();
  }

  async function refresh(): Promise<void> {
    if (disposed || document.visibilityState === "hidden") return;
    const id = ++requestId;
    try {
      const response = await fetch("/api/v1/plugins/aura-motion/rpc/get", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: "null", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
      });
      if (!response.ok) return;
      const body = await response.json();
      const parsed = snapshotSchema.safeParse(body.result);
      if (!disposed && id === requestId && body.ok && parsed.success) apply(parsed.data);
    } catch { /* Keep the last valid background through a transient disconnect. */ }
  }
  function onChange(event: Event): void {
    const parsed = snapshotSchema.safeParse((event as CustomEvent).detail);
    if (parsed.success && !disposed) { requestId++; apply(parsed.data); }
  }
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    controller.abort();
    observer.disconnect();
    for (const effect of effects.values()) effect.dispose();
    effects.clear();
    clearInterval(timer);
    window.removeEventListener(LOCAL_CHANGE, onChange);
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
    signal.removeEventListener("abort", dispose);
    style.remove();
  }
  // Refresh small metadata only, never image bytes, for changes from other clients.
  const timer = setInterval(() => { void refresh(); }, 15000);
  window.addEventListener(LOCAL_CHANGE, onChange);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  signal.addEventListener("abort", dispose, { once: true });
  if (signal.aborted) dispose(); else void refresh();
  return dispose;
}
