import { Buffer } from "node:buffer";
import { MAX_GIF_BYTES, MAX_ANIMATED_SIDE, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "./model.ts";

type ImageMime = "image/png" | "image/jpeg" | "image/gif" | "video/mp4" | "video/webm";
const base64Length = (bytes: number) => Math.ceil(bytes / 3) * 4;

export function decodeImage(dataUrl: string): { mime: ImageMime; bytes: Buffer } {
  const match = /^data:(image\/(?:png|jpeg|gif)|video\/(?:mp4|webm));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  const limit = match?.[1]?.startsWith("video/") ? MAX_VIDEO_BYTES : match?.[1] === "image/gif" ? MAX_GIF_BYTES : MAX_IMAGE_BYTES;
  if (!match || match[2]!.length > base64Length(limit)) {
    throw new Error("Choose a PNG or JPG up to 2 MB, a GIF up to 8 MB, or an MP4/WebM video up to 24 MB.");
  }
  const bytes = Buffer.from(match[2]!, "base64");
  if (bytes.length > limit || bytes.toString("base64") !== match[2]) {
    throw new Error("Invalid or oversized image.");
  }
  const mime = match[1] as ImageMime;
  const png = bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    && bytes.toString("ascii", 12, 16) === "IHDR"
    && bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(16) <= 16384
    && bytes.readUInt32BE(20) > 0 && bytes.readUInt32BE(20) <= 16384;
  const jpg = jpegDimensionsValid(bytes) && bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    && bytes[bytes.length - 2] === 255 && bytes[bytes.length - 1] === 217;
  if ((mime === "image/png" && !png) || (mime === "image/jpeg" && !jpg) || (mime === "image/gif" && !gifValid(bytes))
    || (mime === "video/mp4" && !mp4Valid(bytes)) || (mime === "video/webm" && !webmValid(bytes))) {
    throw new Error("The file contents do not match a PNG, JPG, GIF, MP4 or WebM file.");
  }
  return { mime, bytes };
}

// Check the GIF signature, logical screen size and trailer without decoding
// untrusted frames on the server.
function gifValid(bytes: Buffer): boolean {
  if (bytes.length < 14) return false;
  const signature = bytes.toString("ascii", 0, 6);
  if (signature !== "GIF87a" && signature !== "GIF89a") return false;
  const width = bytes.readUInt16LE(6), height = bytes.readUInt16LE(8);
  return width > 0 && height > 0 && width <= MAX_ANIMATED_SIDE && height <= MAX_ANIMATED_SIDE && bytes[bytes.length - 1] === 0x3b;
}

// An ISO media file opens with an `ftyp` box: a 32-bit size, the type, then a
// major brand and compatible brands. HEIC, AVIF, MOV and 3GP share the box, so
// require an MP4 brand among them.
const MP4_BRANDS = new Set(["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "dash", "M4V ", "M4VH", "M4VP", "mmp4"]);
function mp4Valid(bytes: Buffer): boolean {
  if (bytes.length < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") return false;
  const size = bytes.readUInt32BE(0);
  if (size < 16 || size > bytes.length) return false;
  for (let offset = 8; offset + 4 <= size; offset += offset === 8 ? 8 : 4) { // major brand, skip minor version, then compatible brands
    if (MP4_BRANDS.has(bytes.toString("ascii", offset, offset + 4))) return true;
  }
  return false;
}

// WebM is Matroska: an EBML header whose DocType element reads "webm".
function webmValid(bytes: Buffer): boolean {
  return bytes.length >= 32 && bytes.readUInt32BE(0) === 0x1a45dfa3
    && bytes.subarray(0, 64).includes(Buffer.from([0x42, 0x82])) && bytes.subarray(0, 64).includes(Buffer.from("webm", "ascii"));
}

// Walk length-prefixed JPEG markers, stopping at the first scan. This checks
// real frame dimensions without decoding untrusted pixels on the server.
function jpegDimensionsValid(bytes: Buffer): boolean {
  if (bytes[0] !== 255 || bytes[1] !== 216) return false;
  let position = 2;
  let dimensions = false;
  while (position + 3 < bytes.length) {
    if (bytes[position++] !== 255) return false;
    while (bytes[position] === 255) position++;
    const marker = bytes[position++];
    if (marker === undefined || marker === 0 || marker === 217) return false;
    if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
    if (position + 2 > bytes.length) return false;
    const length = bytes.readUInt16BE(position);
    if (length < 2 || position + length > bytes.length) return false;
    if (marker === 218) return dimensions;
    if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
      if (length < 8) return false;
      const height = bytes.readUInt16BE(position + 3);
      const width = bytes.readUInt16BE(position + 5);
      if (!width || !height || width > 16384 || height > 16384) return false;
      dimensions = true;
    }
    position += length;
  }
  return false;
}
