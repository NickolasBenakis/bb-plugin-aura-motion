# Changelog

## 0.3.4

- Make New thread readable on phones (the bb mobile app and phone browsers).
  The Recent list and the project row sit on their own glass card instead of
  bare wallpaper, and the opaque band around the composer clears so the
  wallpaper shows as one picture.
- On phones, Sheer chats use Glass's fill, so a bright video frame behind the
  full-width message column no longer washes out muted text.
- Phone rules use the same test BB uses for touch sizing
  (`max-width: 767px` with a coarse pointer), so desktop, including a narrow
  window driven by a mouse, looks exactly as before.

## 0.3.3

- Make the area behind the composer solid below its soft top fade in Glass and
  Sheer. At 95% tint, bright text still showed faintly beside the workspace
  and approval row under the composer.

## 0.3.2

- Make the area behind the composer nearly opaque in Glass and Sheer (95%
  tint) and raise the composer capsule to 95% in light and 92% in dark, so
  text scrolling underneath no longer shows through.
- Give BB's question card, which replaces the composer while an agent waits
  for an answer, the same glass fill; on its own it is only 6% opaque.
- Move the workflows to `actions/checkout@v5` and `actions/setup-node@v5`,
  which run on Node 24.

## 0.3.1

- Hide messages that scroll under the composer in Glass and Sheer: the area
  behind the composer gets a soft tint, and the composer capsule is more opaque
  (90% light, 80% dark), so older text no longer shows through it.
- Update the plugin overview for glass chats.
- Add CI for pull requests and pushes to main, and release automation: merging
  a version bump to main runs the checks, tags `vX.Y.Z` and publishes a GitHub
  release with the changelog notes.

## 0.3.0

- Add **Behind your messages** (Solid, Glass, Sheer): show the wallpaper, photo,
  GIF or video behind the chat itself, not only in the margins. Solid (the
  default) is unchanged, and the choice is saved with each slot.
- Glass and Sheer draw one floating sheet behind the message column, modeled on
  Apple's materials: heavy blur with vibrancy, a lit rim and hairline, grain,
  and continuous (squircle) corners where the browser supports `corner-shape`.
  In dark mode the glass dims what it covers, so bright video frames cannot wash
  out text.
- The sheet tracks the column through resizes and thread switches, keeps a 10 px
  inset from the panel and header at every width, and widens text padding on
  narrow panels and phones.
- The thread header floats over the wallpaper without a bar; messages fade at the
  top edge and blur progressively under the composer, which becomes a glass
  capsule. Reduce Transparency turns every glass surface solid.
- Redesign the settings page: grouped cards, switches, a segmented control with
  a raised thumb, styled sliders and selects, slot cards, a glass action bar, and
  a live preview that toggles between Chat (showing the chosen surface) and New
  thread.
- Add `bb aura-motion chat solid|glass|sheer`.
- Tests: sheet geometry at 13 device widths, chat-surface persistence and CLI,
  settings editor behavior, and an opt-in browser check (`npm run test:responsive`)
  across eight device sizes in light and dark.

## 0.2.0

- Accept MP4 (H.264) and WebM video wallpapers up to 24 MB and 4,096 px per
  side, so a 4K loop plays in full colour. With No texture the video plays
  directly; with Capy dithering it becomes the shader's texture, updated once
  per new video frame.
- Videos play muted and looped, and pause while the window is hidden, the panel
  is off-screen, or the system asks for reduced motion.
- Serve stored media with HTTP byte ranges, so browsers can stream and loop video.
- Show a video frame as the thumbnail for video slots.

## 0.1.0

First release of Aura Motion, a fork of Aura 0.2.3 by Mateo Cerquetella.

- Accept animated GIF backgrounds up to 8 MB and 4,096 px per side, stored as
  uploaded. Capy dithering plays them frame by frame with their own frame timing.
- Add texture choices: seven patterns for the image-free effect, five motions for
  photo dithering (including Still), and four dither styles.
- Rename the plugin ID, CLI command, routes, events and CSS classes to
  `aura-motion`.
- Include Aura's unreleased GitHub activity overview.

## Aura history

The entries below are Aura's own changelog up to the fork.

## 0.2.3

- Add 15, 30, and 60 FPS animation-speed controls.
- Add Performance, Balanced, and Sharp WebGL render-quality controls.
- Preserve conservative defaults for existing backgrounds and saved slots.

## 0.2.2

- Add theme-aware reading surfaces to New thread controls and recent threads.
- Cache immutable versioned background images privately for one year.
- Reduce animated dither rendering to 15 FPS and one-third resolution.
- Cache WebGL uniform locations instead of resolving them every frame.

## 0.2.1

- Extend chat wallpapers to the bottom of the pane, including beside the composer.
- Keep half/full wallpaper selection in Aura settings; remove the composer toggle.
- Fade half wallpapers out at the midpoint of New thread; keep chats full-height.
- Restore the correct background when BB reuses panels during navigation.
- Keep wide tables readable beyond the message column, with horizontal scrolling.
- Preserve saved images, slots, dimming preference and scope across reloads.
