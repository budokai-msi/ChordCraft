/**
 * ChordCraft v2 Decoder
 * Supports both lossless (FLAC) and neural codec playback
 */

export interface ChordCraftMetadata {
  bpm: number;
  key: string;
  time: string;
  chords: string;
}

export interface AudioPayload {
  format: 'flac' | 'neural_codec';
  sampleRate: number;
  channels: number;
  sha256?: string;
  chunks?: number;
  chunkSize?: number;
  duration?: number;
  model?: string;
  tokens?: number;
  compressionRatio?: number;
}

export interface ChordCraftSong {
  meta: ChordCraftMetadata;
  analysis: {
    chords: string;
  };
  audio?: AudioPayload;
  neural?: AudioPayload;
  flacData?: ArrayBuffer;
  neuralTokens?: number[];
}

export class ChordCraftDecoder {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Parse ChordCraft v2 code and extract all components
   */
  async parseChordCraftCode(code: string): Promise<ChordCraftSong> {
    const lines = code.split('\n');
    let currentLine = 0;

    // Parse metadata
    const metaMatch = code.match(/meta:\s*\{\s*bpm:\s*(\d+),\s*key:\s*"([^"]+)",\s*time:\s*"([^"]+)"\s*\}/);
    if (!metaMatch) throw new Error('Invalid metadata format');

    const meta: ChordCraftMetadata = {
      bpm: parseInt(metaMatch[1]),
      key: metaMatch[2],
      time: metaMatch[3]
    };

    // Parse chords
    const chordsMatch = code.match(/chords:\s*([^}]+)/);
    const chords = chordsMatch ? chordsMatch[1].trim() : '| N | N | N | N |';

    // Parse audio payload
    const audioMatch = code.match(/audio:\s*\{([^}]+)\}/);
    let audio: AudioPayload | undefined;
    if (audioMatch) {
      const audioStr = audioMatch[1];
      const formatMatch = audioStr.match(/format:\s*"([^"]+)"/);
      const srMatch = audioStr.match(/sr:\s*(\d+)/);
      const channelsMatch = audioStr.match(/channels:\s*(\d+)/);
      const shaMatch = audioStr.match(/sha256:\s*"([^"]+)"/);
      const chunksMatch = audioStr.match(/chunks:\s*(\d+)/);
      const chunkSizeMatch = audioStr.match(/chunk_size:\s*(\d+)/);

      audio = {
        format: (formatMatch?.[1] as 'flac' | 'neural_codec') || 'flac',
        sampleRate: parseInt(srMatch?.[1] || '44100'),
        channels: parseInt(channelsMatch?.[1] || '2'),
        sha256: shaMatch?.[1],
        chunks: parseInt(chunksMatch?.[1] || '0'),
        chunkSize: parseInt(chunkSizeMatch?.[1] || '65536')
      };
    }

    // Parse neural codec
    const neuralMatch = code.match(/neural:\s*\{([^}]+)\}/);
    let neural: AudioPayload | undefined;
    if (neuralMatch) {
      const neuralStr = neuralMatch[1];
      const formatMatch = neuralStr.match(/format:\s*"([^"]+)"/);
      const modelMatch = neuralStr.match(/model:\s*"([^"]+)"/);
      const tokensMatch = neuralStr.match(/tokens:\s*(\d+)/);
      const compressionMatch = neuralStr.match(/compression_ratio:\s*([\d.]+)/);

      neural = {
        format: 'neural_codec',
        sampleRate: 24000,
        channels: 1,
        model: modelMatch?.[1],
        tokens: parseInt(tokensMatch?.[1] || '0'),
        compressionRatio: parseFloat(compressionMatch?.[1] || '0')
      };
    }

    // Extract FLAC data if present
    let flacData: ArrayBuffer | undefined;
    if (audio?.format === 'flac' && audio.chunks) {
      flacData = await this.extractFlacData(code, audio);
    }

    // Extract neural tokens if present
    let neuralTokens: number[] | undefined;
    if (neural) {
      const tokensMatch = code.match(/<<NEURAL_TOKENS>>\s*(\[.*?\])/s);
      if (tokensMatch) {
        try {
          neuralTokens = JSON.parse(tokensMatch[1]);
        } catch (e) {
          console.warn('Failed to parse neural tokens:', e);
        }
      }
    }

    return {
      meta,
      analysis: { chords },
      audio,
      neural,
      flacData,
      neuralTokens
    };
  }

  /**
   * Extract and reconstruct FLAC data from code chunks
   */
  private async extractFlacData(code: string, audio: AudioPayload): Promise<ArrayBuffer> {
    const chunks: string[] = [];
    
    for (let i = 1; i <= (audio.chunks || 0); i++) {
      const chunkRegex = new RegExp(`<<PAYLOAD:FLAC:${i}>>\\s*([\\s\\S]*?)(?=<<PAYLOAD:FLAC:|\\n\\})`, 'g');
      const match = chunkRegex.exec(code);
      if (match) {
        chunks[i - 1] = match[1].replace(/\s+/g, '');
      }
    }

    const b64Data = chunks.join('');
    const binaryString = atob(b64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Verify checksum if available
    if (audio.sha256 && typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (hashHex !== audio.sha256) {
        throw new Error('Checksum mismatch - audio data may be corrupted');
      }
    }

    return bytes.buffer;
  }

  /**
   * Play audio from ChordCraft song data
   * Prioritizes lossless over neural codec
   */
  async playAudio(song: ChordCraftSong): Promise<AudioBufferSourceNode> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    let audioBuffer: AudioBuffer;

    // Try lossless first (guaranteed identical)
    if (song.flacData) {
      try {
        audioBuffer = await this.decodeFlac(song.flacData);
        // Memory cleanup: null out large data after decode
        song.flacData = undefined;
      } catch (e) {
        console.warn('FLAC decode failed, falling back to neural:', e);
        audioBuffer = await this.decodeNeural(song.neuralTokens || []);
      }
    } 
    // Fall back to neural codec (near-identical)
    else if (song.neuralTokens) {
      audioBuffer = await this.decodeNeural(song.neuralTokens);
    }
    // Last resort: synthesize from metadata
    else {
      audioBuffer = await this.synthesizeFromMetadata(song.meta);
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();

    return source;
  }

  /**
   * Decode ChordCraftSong to ArrayBuffer (WAV format) for transport control
   */
  async decodeToArrayBuffer(song: ChordCraftSong): Promise<ArrayBuffer> {
    // 1) Try lossless FLAC if present
    if (song.flacData && song.audio?.format === "flac") {
      // Try native decode first (Chrome/Edge)
      if (this.audioContext) {
        try {
          const buf = await this.audioContext.decodeAudioData(song.flacData.slice(0)); // copy
          return this.audioBufferToWav(buf);
        } catch {
          // fall through to ffmpeg
        }
      }
      // ffmpeg.wasm fallback (works cross-browser)
      const { getFFmpeg } = await import('./ffmpegSingleton');
      const ffmpeg = await getFFmpeg();
      const inName = "in.flac";
      const outName = "out.wav";
      // write
      ffmpeg.FS("writeFile", inName, new Uint8Array(song.flacData));
      // transcode → WAV 44.1k/2ch (engine expects standard)
      await ffmpeg.run("-i", inName, "-ar", "44100", "-ac", "2", "-f", "wav", outName);
      const out = ffmpeg.FS("readFile", outName);
      // cleanup (best effort)
      try { ffmpeg.FS("unlink", inName); ffmpeg.FS("unlink", outName); } catch {}
      return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
    }

    // 2) Neural tokens path
    if (song.neuralTokens && song.neural_audio?.codec === "neural_codec") {
      const ab = await this.decodeNeural(song.neuralTokens);
      return this.audioBufferToWav(ab);
    }

    // 3) Synthetic fallback
    const synth = await this.synthesizeFromMetadata(song.meta);
    return this.audioBufferToWav(synth);
  }

  /**
   * Convert AudioBuffer to WAV ArrayBuffer
   */
  private audioBufferToWav(ab: AudioBuffer): ArrayBuffer {
    const numCh = ab.numberOfChannels;
    const numFrames = ab.length;
    const sr = ab.sampleRate;

    // interleave
    const buffers: Float32Array[] = [];
    for (let ch = 0; ch < numCh; ch++) buffers.push(ab.getChannelData(ch));

    const interleaved = new Float32Array(numFrames * numCh);
    for (let i = 0; i < numFrames; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        interleaved[i * numCh + ch] = buffers[ch][i];
      }
    }

    // PCM16
    const bytesPerSample = 2;
    const blockAlign = numCh * bytesPerSample;
    const dataSize = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    let off = 0;
    const writeStr = (s: string) => { for (let i=0;i<s.length;i++) view.setUint8(off++, s.charCodeAt(i)); };
    writeStr("RIFF");
    view.setUint32(off, 36 + dataSize, true); off += 4;
    writeStr("WAVE");
    writeStr("fmt ");
    view.setUint32(off, 16, true); off += 4;            // PCM chunk size
    view.setUint16(off, 1, true); off += 2;             // PCM format
    view.setUint16(off, numCh, true); off += 2;
    view.setUint32(off, sr, true); off += 4;
    view.setUint32(off, sr * blockAlign, true); off += 4; // byte rate
    view.setUint16(off, blockAlign, true); off += 2;
    view.setUint16(off, bytesPerSample * 8, true); off += 2; // bits per sample
    writeStr("data");
    view.setUint32(off, dataSize, true); off += 4;

    // write samples
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    for (let i = 0; i < interleaved.length; i++, off += 2) {
      const s = Math.floor(clamp(interleaved[i]) * 0x7fff);
      view.setInt16(off, s, true);
    }

    return buffer;
  }

  /**
   * Decode FLAC data to AudioBuffer
   */
  private async decodeFlac(flacData: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const startTime = performance.now();
    
    // 1) Try native decode first (Chrome/Edge often OK)
    try {
      const result = await this.audioContext.decodeAudioData(flacData.slice(0));
      console.log(`FLAC decode: native (${(performance.now() - startTime).toFixed(1)}ms)`);
      return result;
    } catch (_) {
      // continue to wasm fallback
    }

    // 2) Universal fallback via ffmpeg.wasm (Web Worker for UI responsiveness)
    try {
      const worker = new Worker(new URL('../workers/flacWorker.ts', import.meta.url), { type: 'module' });
      
      const wavBuf = await new Promise<ArrayBuffer>((resolve, reject) => {
        worker.onmessage = (ev) => {
          if (ev.data?.error) {
            reject(new Error(ev.data.error));
          } else {
            resolve(ev.data as ArrayBuffer);
          }
          worker.terminate();
        };
        worker.onerror = (e) => { 
          worker.terminate(); 
          reject(e.error || new Error('ffmpeg worker error')); 
        };
        worker.postMessage(flacData, [flacData]); // transfer ownership
      });

      const result = await this.audioContext.decodeAudioData(wavBuf);
      console.log(`FLAC decode: wasm worker (${(performance.now() - startTime).toFixed(1)}ms)`);
      return result;
    } catch (e) {
      console.error('ffmpeg.wasm FLAC decode failed:', e);
      throw new Error('FLAC decoding failed - please use WAV format or neural codec');
    }
  }

  /**
   * Decode neural codec tokens to AudioBuffer
   */
  private async decodeNeural(tokens: number[]): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    // Placeholder implementation
    // In production, you'd load the actual neural codec model
    console.log('Decoding neural tokens (placeholder implementation)');
    
    // For demo, generate a simple tone based on tokens
    const sampleRate = 24000;
    const duration = tokens.length / 100; // Rough duration estimate
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < channelData.length; i++) {
      const tokenIndex = Math.floor(i / channelData.length * tokens.length);
      const token = tokens[tokenIndex] || 0;
      channelData[i] = (token / 1000) * 0.1; // Convert token to audio sample
    }
    
    return buffer;
  }

  /**
   * Synthesize audio from metadata (fallback)
   */
  private async synthesizeFromMetadata(meta: ChordCraftMetadata): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = 44100;
    const duration = 4; // 4 seconds
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Generate a simple tone based on BPM
    const frequency = 440; // A4 note
    for (let i = 0; i < channelData.length; i++) {
      const time = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * frequency * time) * 0.1;
    }
    
    return buffer;
  }

  /**
   * Get playback strategy for a song
   */
  getPlaybackStrategy(song: ChordCraftSong): 'lossless' | 'neural' | 'synthetic' {
    if (song.flacData) return 'lossless';
    if (song.neuralTokens) return 'neural';
    return 'synthetic';
  }

  /**
   * Compute SHA-256 hash of ArrayBuffer
   */
  async sha256Hex(ab: ArrayBuffer): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('Crypto API not available');
    }
    
    const h = await crypto.subtle.digest('SHA-256', ab);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify checksum integrity for identical playback guarantee
   */
  async verifyChecksum(song: ChordCraftSong): Promise<{ valid: boolean; hash: string; expected: string }> {
    if (!song.flacData || !song.audio?.sha256) {
      return { valid: false, hash: '', expected: song.audio?.sha256 || '' };
    }

    try {
      const hash = await this.sha256Hex(song.flacData);
      
      return {
        valid: hash === song.audio.sha256,
        hash,
        expected: song.audio.sha256
      };
    } catch (e) {
      console.error('Checksum verification failed:', e);
      return { valid: false, hash: '', expected: song.audio.sha256 };
    }
  }

  /**
   * Get file size estimate for code
   */
  getSizeEstimate(song: ChordCraftSong): { lossless: number; neural: number; total: number } {
    const lossless = song.flacData ? song.flacData.byteLength : 0;
    const neural = song.neuralTokens ? song.neuralTokens.length * 2 : 0; // 2 bytes per token
    const total = lossless + neural;
    
    return { lossless, neural, total };
  }
}

// Export singleton instance
export const chordCraftDecoder = new ChordCraftDecoder();
