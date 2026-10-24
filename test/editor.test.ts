import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test, { after } from "node:test";
import { JSDOM } from "jsdom";
import { act, fireEvent, waitFor } from "@testing-library/react";
import { installTestPluginRuntime, renderSlot } from "@get-bb/plugin-sdk/testing/app";
import { defaults, type ApplyInput, type Snapshot } from "../lib/model.ts";

// The editor imports its stylesheet; the bundler handles that in BB, so stub it here.
registerHooks({ load: (url, context, next) => url.endsWith(".css") ? { format: "module", source: "", shortCircuit: true } : next(url, context) });
const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", { url: "http://bb.test/" });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
  CustomEvent: dom.window.CustomEvent, MutationObserver: dom.window.MutationObserver, getComputedStyle: dom.window.getComputedStyle,
  IS_REACT_ACT_ENVIRONMENT: true,
});
// jsdom has no WebGL; the preview then keeps its plain image, as in real browsers without it.
dom.window.HTMLCanvasElement.prototype.getContext = (() => null) as typeof dom.window.HTMLCanvasElement.prototype.getContext;
installTestPluginRuntime();
const { BackgroundEditor } = await import("../app.tsx");
after(() => dom.window.close());

function render(initial: Partial<Snapshot["settings"]> = {}) {
  let snapshot: Snapshot = { settings: { ...defaults, ...initial }, image: null, slots: [], activeSlot: null };
  const applied: ApplyInput[] = [];
  const slot = renderSlot({ component: BackgroundEditor }, {}, { rpc: {
    get: () => snapshot,
    apply: input => { const value = input as ApplyInput; applied.push(value); snapshot = { ...snapshot, settings: value.settings }; return snapshot; },
  } });
  const q = <T extends Element>(selector: string) => slot.container.querySelector<T>(selector);
  const button = (name: string) => [...slot.container.querySelectorAll("button")].find(b => b.textContent === name)!;
  return { slot, applied, q, button };
}

test("the editor keeps its existing controls, labels and checkbox roles", async () => {
  const { slot, q } = render();
  try {
    await waitFor(() => assert.ok(q("fieldset:not([disabled])")));
    for (const label of ["New thread screen only", "Half wallpaper on New thread", "Activity overview", "Upload background image", "Save to slot", "Slot name"]) {
      const control = q<HTMLInputElement>(`[aria-label="${label}"]`);
      assert.ok(control, `${label} is present`);
      if (["New thread screen only", "Half wallpaper on New thread", "Activity overview"].includes(label)) assert.equal(control.type, "checkbox", `${label} stays a checkbox`);
    }
    for (const name of ["Apply background", "Reset to default", "Save slot 1"]) assert.ok([...slot.container.querySelectorAll("button")].some(b => b.textContent === name), name);
    assert.equal(slot.container.querySelectorAll(".aura-motion-slot").length, 6);
  } finally { slot.unmount(); }
});

test("choosing a chat surface updates the preview and applies it with the background", async () => {
  const { slot, q, button, applied } = render();
  try {
    await waitFor(() => assert.ok(q("fieldset:not([disabled])")));
    assert.equal(button("Solid").getAttribute("aria-pressed"), "true");
    assert.equal(q(".aura-motion-preview-chat")?.getAttribute("data-surface"), "solid");
    await act(async () => { fireEvent.click(button("Glass")); });
    assert.equal(button("Glass").getAttribute("aria-pressed"), "true");
    assert.equal(q(".aura-motion-preview-chat")?.getAttribute("data-surface"), "glass");
    assert.match(slot.container.textContent!, /frosted message column/);
    await act(async () => { fireEvent.click(button("Apply background")); });
    await waitFor(() => assert.equal(applied.at(-1)?.settings.chatSurface, "glass"));
    assert.deepEqual(applied.at(-1)?.image, { action: "keep" });
  } finally { slot.unmount(); }
});

test("New thread only hides the chat surface choice and the preview can switch screens", async () => {
  const { slot, q, button } = render({ newThreadOnly: true, chatSurface: "glass" });
  try {
    await waitFor(() => assert.ok(q("fieldset:not([disabled])")));
    assert.equal([...slot.container.querySelectorAll("button")].some(b => b.textContent === "Sheer"), false);
    assert.equal(q(".aura-motion-preview-chat")?.getAttribute("data-surface"), "solid");
    await act(async () => { fireEvent.click(button("New thread")); });
    assert.equal(q(".aura-motion-preview-chat"), null);
    assert.ok(q(".aura-motion-preview-greeting"));
    assert.equal(button("New thread").getAttribute("aria-pressed"), "true");
  } finally { slot.unmount(); }
});

test("sliders expose their fill level for the styled track", async () => {
  const { slot, q } = render({ effect: "pixels", intensity: .25 });
  try {
    await waitFor(() => assert.ok(q("fieldset:not([disabled])")));
    const slider = q<HTMLInputElement>('input[type="range"]')!;
    assert.equal(slider.style.getPropertyValue("--aura-motion-fill"), "25%");
  } finally { slot.unmount(); }
});
