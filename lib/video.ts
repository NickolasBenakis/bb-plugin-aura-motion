// A muted, looping <video> wallpaper. It is shown directly with No texture and
// is the texture source for the dither shader, so one decoder serves both.

export interface VideoWallpaper {
  readonly element: HTMLVideoElement;
  setFit(fit: "cover" | "contain"): void;
  dispose(): void;
}

export function mountVideo(parent: HTMLElement, url: string, fit: "cover" | "contain"): VideoWallpaper {
  const video = document.createElement("video");
  video.className = "aura-motion-capy-video";
  video.muted = true; video.defaultMuted = true; video.loop = true; video.playsInline = true;
  video.autoplay = false; video.preload = "auto"; video.disablePictureInPicture = true;
  video.setAttribute("aria-hidden", "true"); video.tabIndex = -1;
  video.style.objectFit = fit;
  video.src = url;
  parent.prepend(video);
  let visible = true;
  let disposed = false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Play only while someone can see it; reduced motion keeps the first frame.
  function sync(): void {
    if (disposed) return;
    if (!document.hidden && visible && !reduced.matches) void video.play().catch(() => {});
    else video.pause();
  }
  const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; sync(); });
  intersection.observe(parent);
  document.addEventListener("visibilitychange", sync); reduced.addEventListener("change", sync);
  video.addEventListener("loadeddata", sync, { once: true });
  sync();
  return {
    element: video,
    setFit(next) { video.style.objectFit = next; },
    dispose() {
      if (disposed) return;
      disposed = true;
      intersection.disconnect(); document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync);
      video.pause(); video.removeAttribute("src"); video.load(); video.remove();
    },
  };
}
