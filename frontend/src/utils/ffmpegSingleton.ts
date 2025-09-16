/**
 * ffmpeg.wasm Singleton for CDN Loading
 * 
 * This singleton ensures ffmpeg.wasm is loaded only once and uses CDN URLs
 * for production compatibility. The core/wasm/worker files are loaded from
 * unpkg CDN instead of local node_modules paths.
 */

let _ffmpeg: any | null = null;
let _loading: Promise<any> | null = null;

export async function getFFmpeg() {
  if (_ffmpeg) return _ffmpeg;
  if (_loading) return _loading;

  _loading = (async () => {
    try {
      const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');

      // Pin a version for determinism - using stable 0.12.6
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      // Convert CDN URLs to blob URLs for CORS compatibility
      const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm');
      const workerURL = await toBlobURL(`${base}/ffmpeg-core.worker.js`, 'text/javascript');

      console.log('Loading ffmpeg.wasm from CDN...');
      const ffmpeg = createFFmpeg({ 
        log: false,
        coreURL,
        wasmURL,
        workerURL
      });
      
      await ffmpeg.load();
      console.log('ffmpeg.wasm loaded successfully');

      _ffmpeg = ffmpeg;
      return ffmpeg;
    } catch (error) {
      console.error('Failed to load ffmpeg.wasm:', error);
      _loading = null; // Reset so we can try again
      throw error;
    }
  })();

  return _loading;
}

/**
 * Reset the singleton (useful for testing or error recovery)
 */
export function resetFFmpeg() {
  _ffmpeg = null;
  _loading = null;
}
