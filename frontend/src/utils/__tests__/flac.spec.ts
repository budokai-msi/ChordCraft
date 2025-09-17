// src/utils/__tests__/flac.spec.ts
import { describe, it, expect } from "vitest";
import { chordCraftDecoder } from "../ChordCraftDecoder";

const makeCode = (b64a: string, b64b: string, sha?: string) => `
Song {
  meta: { bpm: 120, key: "C", time: "4/4" }
  analysis: { chords: | N | N | N | N | }
  audio: { format: "flac", sr: 44100, channels: 2, sha256: "${sha || ""}", chunks: 2, chunk_size: 10 }
<<PAYLOAD:FLAC:1>>
${b64a}
<<PAYLOAD:FLAC:2>>
${b64b}
}
`;

describe("FLAC chunks", () => {
  it("reassembles base64 payload", async () => {
    const bytes = new Uint8Array([1,2,3,4,5,6,7,8]);
    const b64 = btoa(String.fromCharCode(...bytes));
    const a = b64.slice(0, 6);
    const b = b64.slice(6);

    const code = makeCode(a, b);
    const song = await chordCraftDecoder.parseChordCraftCode(code);
    expect(song.flacData).toBeInstanceOf(ArrayBuffer);
    expect((song.flacData as ArrayBuffer).byteLength).toBe(bytes.length);
  });
});
