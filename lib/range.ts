// Video elements fetch media with HTTP Range requests and expect 206 replies
// to stream, seek and loop. Only a single range is supported, as browsers send.

export type ByteRange = { start: number; end: number } | "unsatisfiable" | null;

/** Parse a `Range: bytes=…` header against a body of `size` bytes. null = serve it all. */
export function parseRange(header: string | undefined, size: number): ByteRange {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return null; // Malformed or multi-range: ignore it.
  if (match[1] === "") { // Suffix: the last N bytes.
    const length = Number(match[2]);
    if (length === 0) return "unsatisfiable";
    return { start: Math.max(0, size - length), end: size - 1 };
  }
  const start = Number(match[1]);
  const end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  if (start >= size || end < start) return "unsatisfiable";
  return { start, end };
}
