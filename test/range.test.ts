import assert from "node:assert/strict";
import test from "node:test";
import { parseRange } from "../lib/range.ts";

test("byte ranges follow RFC 9110 single-range semantics", () => {
  assert.equal(parseRange(undefined, 100), null);
  assert.deepEqual(parseRange("bytes=0-", 100), { start: 0, end: 99 });
  assert.deepEqual(parseRange("bytes=10-19", 100), { start: 10, end: 19 });
  assert.deepEqual(parseRange("bytes=90-500", 100), { start: 90, end: 99 }); // end clamps to the body
  assert.deepEqual(parseRange("bytes=-10", 100), { start: 90, end: 99 }); // suffix
  assert.deepEqual(parseRange("bytes=-500", 100), { start: 0, end: 99 });
  assert.equal(parseRange("bytes=100-", 100), "unsatisfiable");
  assert.equal(parseRange("bytes=20-10", 100), "unsatisfiable");
  assert.equal(parseRange("bytes=-0", 100), "unsatisfiable");
  for (const ignored of ["bytes=0-1,5-9", "items=0-1", "bytes=-", "bytes=a-b"]) assert.equal(parseRange(ignored, 100), null);
});
