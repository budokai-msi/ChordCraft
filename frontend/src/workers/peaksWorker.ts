// Minimal WAV parser + peaks per bucket in a Worker.
//
// Worker API:
// postMessage({ id, wav: ArrayBuffer, buckets?: number })
// => reply: { id, peaks: { min: number[], max: number[] } }

type MsgIn = { id: string; wav: ArrayBuffer; buckets?: number };
type MsgOut = { id: string; peaks: { min: number[]; max: number[] } };

function readU16(v: DataView, o: number) { return v.getUint16(o, true); }
function readU32(v: DataView, o: number) { return v.getUint32(o, true); }
function readStr(v: DataView, o: number, n: number) {
  let s = ""; for (let i=0;i<n;i++) s += String.fromCharCode(v.getUint8(o+i)); return s;
}

function parseWav(ab: ArrayBuffer) {
  const v = new DataView(ab);
  if (readStr(v,0,4)!=="RIFF" || readStr(v,8,4)!=="WAVE") throw new Error("Not WAV");

  let off = 12, fmtChunkOff = -1, dataChunkOff = -1, dataSize = 0;
  while (off < v.byteLength) {
    const id = readStr(v, off, 4);
    const size = readU32(v, off+4);
    if (id === "fmt ") fmtChunkOff = off + 8;
    if (id === "data") { dataChunkOff = off + 8; dataSize = size; break; }
    off += 8 + size + (size & 1);
  }
  if (fmtChunkOff < 0 || dataChunkOff < 0) throw new Error("Invalid WAV");

  const audioFormat = readU16(v, fmtChunkOff + 0);
  const numCh       = readU16(v, fmtChunkOff + 2);
  const sampleRate  = readU32(v, fmtChunkOff + 4);
  const bitDepth    = readU16(v, fmtChunkOff + 14);
  if (audioFormat !== 1 && audioFormat !== 3) throw new Error("Only PCM/float");

  const bytesPerSample = bitDepth >> 3;
  const frameCount = dataSize / (bytesPerSample * numCh);

  // De-interleave into Float32
  const float = new Float32Array(frameCount * numCh);
  let p = dataChunkOff;
  for (let i = 0; i < frameCount; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      let val: number;
      if (audioFormat === 1) {
        // PCM integer
        if (bitDepth === 16) val = v.getInt16(p, true) / 32768;
        else if (bitDepth === 24) {
          const b0 = v.getUint8(p), b1 = v.getUint8(p+1), b2 = v.getUint8(p+2);
          const signed = (b2 & 0x80) ? (((b2^0xFF)<<16)|((b1^0xFF)<<8)|((b0^0xFF))) * -1 - 1
                                     : (b2<<16)|(b1<<8)|b0;
          val = signed / 8388608;
        } else if (bitDepth === 32) val = v.getInt32(p, true) / 2147483648;
        else throw new Error("Unsupported PCM depth");
      } else {
        // IEEE float 32
        if (bitDepth !== 32) throw new Error("Unsupported float depth");
        val = v.getFloat32(p, true);
      }
      float[i*numCh + ch] = Math.max(-1, Math.min(1, val));
      p += bytesPerSample;
    }
  }
  return { numCh, sampleRate, bitDepth, frames: frameCount, data: float };
}

function computePeaks(float: Float32Array, frames: number, numCh: number, buckets: number) {
  const min = new Array<number>(buckets).fill(0);
  const max = new Array<number>(buckets).fill(0);
  const step = Math.max(1, Math.floor(frames / buckets));

  for (let b = 0; b < buckets; b++) {
    let lo =  1, hi = -1;
    const start = b * step;
    const end = Math.min(frames, start + step);
    for (let i = start; i < end; i++) {
      // Mixdown fast (avg channels)
      let s = 0;
      for (let ch = 0; ch < numCh; ch++) s += float[i*numCh + ch];
      s /= numCh;
      if (s < lo) lo = s;
      if (s > hi) hi = s;
    }
    min[b] = lo; max[b] = hi;
  }
  return { min, max };
}

self.onmessage = (e: MessageEvent<MsgIn>) => {
  try {
    const { id, wav, buckets = 1000 } = e.data;
    const { numCh, frames, data } = parseWav(wav);
    const peaks = computePeaks(data, frames, numCh, buckets);
    (self as any).postMessage({ id, peaks } as MsgOut);
  } catch (err: any) {
    (self as any).postMessage({ id, error: err?.message || String(err) });
  }
};
