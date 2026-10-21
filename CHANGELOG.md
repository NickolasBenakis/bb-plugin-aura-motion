# Changelog

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
