import React from "react";
import { useNavigate } from "react-router-dom";
import { useChordCraftStore } from "../store/useChordCraftStore";
import { chordCraftDecoder } from "../utils/ChordCraftDecoder";
import { IntegrityBadge } from "../components/IntegrityBadge";

async function sha256Hex(ab: ArrayBuffer) {
  const h = await crypto.subtle.digest("SHA-256", ab);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export default function Studio() {
  const navigate = useNavigate();
  const { code, song, setSong, integrity, setIntegrity, strategy, setStrategy } = useChordCraftStore();

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

  const onPlay = async () => {
    if (!song) return;
    try {
      // Ensure user gesture on Safari/iOS
      if (chordCraftDecoder["audioContext"]?.state === "suspended") {
        await chordCraftDecoder["audioContext"]?.resume();
      }
      await chordCraftDecoder.playAudio(song);
    } catch (e) {
      console.error("play failed", e);
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
        <div className="flex items-center gap-2">
          <button onClick={onPlay} className="rounded-lg px-3 py-2 bg-black text-white">
            ▶ Play
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
            <pre className="bg-gray-100 rounded-xl p-3 max-h-[60vh] overflow-auto text-xs">{code}</pre>
            <button
              className="rounded px-2 py-1 text-xs bg-gray-200"
              onClick={() => navigator.clipboard.writeText(code)}
            >Copy all</button>
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
