// src/utils/__tests__/wav.spec.ts
import { describe, it, expect } from "vitest";
import { chordCraftDecoder } from "../ChordCraftDecoder";

describe("WAV writer", () => {
  it("writes valid RIFF/WAVE headers", async () => {
    const ctx = (chordCraftDecoder as any)["audioContext"] as AudioContext;
    const ab = ctx.createBuffer(2, ctx.sampleRate, ctx.sampleRate); // 1s silence
    const buf = (chordCraftDecoder as any)["audioBufferToWav"](ab) as ArrayBuffer;

    const view = new DataView(buf);
    const str = (o: number, n: number) =>
      String.fromCharCode(...Array.from({ length: n }, (_, i) => view.getUint8(o + i)));

    expect(str(0, 4)).toBe("RIFF");
    expect(str(8, 4)).toBe("WAVE");
    expect(str(12, 4)).toBe("fmt ");
    expect(str(36, 4)).toBe("data");
  });
});
