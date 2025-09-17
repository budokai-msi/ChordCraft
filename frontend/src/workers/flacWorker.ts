/// <reference lib="webworker" />
import { getFFmpeg } from '../utils/ffmpegSingleton';

self.onmessage = async (e) => {
  try {
    const flac = new Uint8Array(e.data as ArrayBuffer);
    const ffmpeg = await getFFmpeg();
    
    // Write FLAC to virtual FS
    ffmpeg.FS('writeFile', 'in.flac', flac);
    
    // Transcode FLAC → WAV (44.1k default; keep channels)
    await ffmpeg.run('-hide_banner', '-loglevel', 'error', '-i', 'in.flac', '-f', 'wav', 'out.wav');
    
    const wav = ffmpeg.FS('readFile', 'out.wav');
    
    // Clean up virtual FS to release memory
    try { ffmpeg.FS('unlink', 'in.flac'); } catch {}
    try { ffmpeg.FS('unlink', 'out.wav'); } catch {}
    
    // Transfer the buffer back without copying
    (self as any).postMessage(wav.buffer, [wav.buffer]);
  } catch (err) {
    (self as any).postMessage({ error: String(err) });
  }
};
