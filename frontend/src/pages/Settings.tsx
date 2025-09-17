import React from "react";
import { useChordCraftStore } from "../store/useChordCraftStore";

export default function Settings() {
  const { backendUrl, setBackendUrl, nativeFirst, setNativeFirst, ffmpegLoaded } = useChordCraftStore();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Backend URL</label>
        <input
          value={backendUrl}
          onChange={(e)=>setBackendUrl(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="http://127.0.0.1:5000"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={nativeFirst} onChange={e=>setNativeFirst(e.target.checked)} />
          Prefer native FLAC decode when possible
        </label>
        <p className="text-xs opacity-70">
          ffmpeg.wasm loaded: {ffmpegLoaded ? "yes" : "no (loads on demand)"}
        </p>
      </div>
    </div>
  );
}
