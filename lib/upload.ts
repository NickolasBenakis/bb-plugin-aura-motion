import { MAX_GIF_BYTES, MAX_ANIMATED_SIDE, MAX_IMAGE_BYTES, MAX_UPLOAD_BYTES, MAX_VIDEO_BYTES } from "./model.ts";

const TYPES = /^(image\/png|image\/jpeg|image\/gif|video\/mp4|video\/webm)$/;

/** Read a video's dimensions from its metadata without decoding the whole file. */
function videoSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true; video.preload = "metadata";
    const finish = (done: () => void) => { clearTimeout(timer); video.onloadedmetadata = video.onerror = null; video.removeAttribute("src"); video.load(); done(); };
    const fail = () => finish(() => reject(new Error("This video could not be played here. Choose an MP4 (H.264) or WebM video.")));
    const timer = setTimeout(fail, 15000); // A stalled container never fires either event.
    video.onloadedmetadata = () => { const size = { width: video.videoWidth, height: video.videoHeight }; finish(() => resolve(size)); };
    video.onerror = fail;
    video.src = url;
  });
}

function readDataUrl(file: File, mime: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^;]*;/, `data:${mime};`));
    reader.onerror = () => reject(new Error("Could not read this image.")); reader.readAsDataURL(file);
  });
}

/** Accept camera-sized files; normalize only when necessary to fit storage. */
export async function readImage(file: File): Promise<{ dataUrl: string; resized: boolean }> {
  // Browsers label some files differently (macOS reports .m4v as video/x-m4v),
  // so fall back to the extension whenever the reported type is not one we store.
  const reported = file.type === "video/x-m4v" ? "video/mp4" : file.type;
  const mime = TYPES.test(reported) ? reported : (/\.png$/i.test(file.name) ? "image/png" : /\.jpe?g$/i.test(file.name) ? "image/jpeg" : /\.gif$/i.test(file.name) ? "image/gif"
    : /\.(mp4|m4v)$/i.test(file.name) ? "video/mp4" : /\.webm$/i.test(file.name) ? "video/webm" : "");
  if (!TYPES.test(mime) || file.size > MAX_UPLOAD_BYTES || file.size === 0) throw new Error("Choose a PNG or JPG up to 32 MB, a GIF up to 8 MB, or an MP4/WebM video up to 24 MB.");
  if (mime.startsWith("video/")) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("Choose a video up to 24 MB. Shorten the loop or lower its bitrate.");
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await videoSize(url);
      if (!width || !height) throw new Error("This file has no video track.");
      if (Math.max(width, height) > MAX_ANIMATED_SIDE) throw new Error("Choose a video no larger than 4,096 pixels per side (4K is 3,840).");
    } finally { URL.revokeObjectURL(url); }
    return { dataUrl: await readDataUrl(file, mime), resized: false };
  }
  // Resizing a GIF through a canvas keeps only its first frame, so animated
  // images are stored as uploaded or refused.
  if (mime === "image/gif" && file.size > MAX_GIF_BYTES) throw new Error("Choose a GIF up to 8 MB. Larger GIFs cannot be resized without losing their animation.");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url;
    try { await img.decode(); } catch { throw new Error("This image could not be read. Choose a valid PNG, JPG or GIF."); }
    if (img.naturalWidth > 16384 || img.naturalHeight > 16384) throw new Error("Choose an image no larger than 16,384 pixels per side.");
    if (mime === "image/gif") {
      if (Math.max(img.naturalWidth, img.naturalHeight) > MAX_ANIMATED_SIDE) throw new Error("Choose a GIF no larger than 4,096 pixels per side.");
      return { dataUrl: await readDataUrl(file, mime), resized: false };
    }
    if (file.size <= MAX_IMAGE_BYTES && Math.max(img.naturalWidth, img.naturalHeight) <= 4096) {
      return { dataUrl: await readDataUrl(file, mime), resized: false };
    }
    let scale = Math.min(1, 4096 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    for (let attempt = 0; attempt < 10; attempt++) {
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Image resizing is unavailable in this browser.");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL(mime, 0.9);
      if (dataUrl.length <= Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 22) return { dataUrl, resized: true };
      scale *= 0.75;
    }
    throw new Error("Could not resize the image. Try a smaller PNG or JPG.");
  } finally { URL.revokeObjectURL(url); }
}
