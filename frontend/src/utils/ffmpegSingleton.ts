// basic FFmpeg loader that tries multiple times if it fails
// works with or without SharedArrayBuffer depending on browser setup

let _ffmpeg: any;
let _loading: Promise<{ ffmpeg: any }> | null = null;

export async function getFFmpeg() {
  if (_ffmpeg?.isLoaded?.()) return { ffmpeg: _ffmpeg };
  if (_loading) return _loading;

  _loading = (async () => {
    const { createFFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = createFFmpeg({
      log: false,
      corePath:
        "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js", // using specific version
    });

    const maxAttempts = 3;
    let attempt = 0;
    // retry with delays if loading fails
    while (true) {
      try {
        attempt++;
        await ffmpeg.load();
        _ffmpeg = ffmpeg;
        return { ffmpeg };
      } catch (e) {
        if (attempt >= maxAttempts) throw e;
        await new Promise((r) => setTimeout(r, 350 * attempt));
      }
    }
  })();

  return _loading;
}

// clear everything if you need to start over
export function resetFFmpeg() {
  _ffmpeg = null;
  _loading = null;
}