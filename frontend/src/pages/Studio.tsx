import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChordCraftStore } from "../store/useChordCraftStore";
import { chordCraftDecoder } from "../utils/ChordCraftDecoder";
import { IntegrityBadge } from "../components/IntegrityBadge";
import { TransportBar } from "../components/TransportBar";
import { useAudioEngine } from "../services/AudioEngine";

async function sha256Hex(ab: ArrayBuffer) {
  const h = await crypto.subtle.digest("SHA-256", ab);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export default function Studio() {
  const navigate = useNavigate();
  const { code, song, setSong, integrity, setIntegrity, strategy, setStrategy } = useChordCraftStore();
  const { loadArrayBuffer, play } = useAudioEngine();
  const objectUrlRef = React.useRef<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("");

  React.useEffect(() => {
    (async () => {
      if (!code) { navigate("/"); return; }
      try {
        setIntegrity("verifying");
        const parsed = await chordCraftDecoder.parseChordCraftCode(code);
        setSong(parsed);
        const playback = chordCraftDecoder.getPlaybackStrategy(parsed);
        setStrategy(playback);

        if (parsed.flacData && parsed.audio?.sha256) {
          const hash = await sha256Hex(parsed.flacData);
          setIntegrity(hash === parsed.audio.sha256 ? "ok" : "mismatch");
        } else {
          setIntegrity("unknown");
        }
      } catch (e) {
        console.error(e);
        setIntegrity("mismatch");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  React.useEffect(() => {
    return () => {
      // Transport's provider already revokes internally when replaced/unmount,
      // but if you want double-safety:
      if (objectUrlRef.current) {
        try { URL.revokeObjectURL(objectUrlRef.current); } catch {}
      }
    };
  }, []);

  const prepareAndPlay = async () => {
    if (!song || isLoading) return;
    try {
      setIsLoading(true);
      setLoadingMessage("Preparing audio...");
      
      // iOS/Safari
      if ((chordCraftDecoder as any)["audioContext"]?.state === "suspended") {
        setLoadingMessage("Resuming audio context...");
        await (chordCraftDecoder as any)["audioContext"]?.resume();
      }
      
      setLoadingMessage("Decoding audio...");
      const wav = await chordCraftDecoder.decodeToArrayBuffer(song);
      
      setLoadingMessage("Loading into player...");
      const url = loadArrayBuffer(wav, "audio/wav");
      objectUrlRef.current = url;
      
      setLoadingMessage("Starting playback...");
      play();
    } catch (e) {
      console.error("prepareAndPlay failed", e);
      // Show user-friendly error toast
      toast.error(`Playback failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  if (!code) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Studio</h2>
        <IntegrityBadge
          state={integrity}
          sr={song?.audio?.sampleRate}
          ch={song?.audio?.channels}
        />
      </header>

      <section className="space-y-3">
        <TransportBar />
        
                <div className="flex items-center gap-2">
                  <button 
                    onClick={prepareAndPlay} 
                    disabled={isLoading}
                    className="rounded-lg px-3 py-2 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {loadingMessage || "Loading..."}
                      </>
                    ) : (
                      "▶ Load & Play"
                    )}
                  </button>
          <button onClick={() => location.reload()} className="rounded-lg px-3 py-2 bg-gray-200">
            ⟲ Reset
          </button>
          <span className="text-sm opacity-70">
            Strategy: <b>{strategy ?? "—"}</b>
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Code (read-only)</h3>
            {code && code.length > 4_000_000 && (
              <div className="text-xs text-orange-600">Large code block; editing may be slow.</div>
            )}
            <pre className="bg-gray-100 rounded-xl p-3 max-h-[60vh] overflow-auto text-xs">{code}</pre>
            <div className="flex gap-2">
                      <button
                        className="rounded px-2 py-1 text-xs bg-gray-200"
                        onClick={() => {
                          navigator.clipboard.writeText(code);
                          toast.success("Code copied to clipboard!");
                        }}
                      >Copy all</button>
              <button
                className="rounded px-2 py-1 text-xs bg-gray-200"
                onClick={async () => {
                  if (!song?.flacData || !song.audio?.sha256) return;
                  const h = await crypto.subtle.digest("SHA-256", song.flacData);
                  const hex = Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");
                  const isValid = hex === song.audio.sha256;
                  setIntegrity(isValid ? "ok" : "mismatch");
                  toast.success(isValid ? "✅ Integrity verified!" : "⚠️ Code has been modified");
                }}
              >Re-verify</button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Details</h3>
            <ul className="text-sm">
              <li>BPM: <b>{song?.meta?.bpm ?? "—"}</b></li>
              <li>Key: <b>{song?.meta?.key ?? "—"}</b></li>
              <li>Time: <b>{song?.meta?.time ?? "—"}</b></li>
              <li>Chords: <b>{song?.analysis?.chords ?? "—"}</b></li>
              <li>Audio: <b>{song?.audio?.sampleRate ?? "—"} Hz / {song?.audio?.channels ?? "—"} ch</b></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
