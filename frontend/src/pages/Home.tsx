import React from "react";
import { useNavigate } from "react-router-dom";
import ConnectivityBadge from "../components/ConnectivityBadge";
import DiagnosticsPanel from "../components/DiagnosticsPanel";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">ChordCraft Studio</h1>
          <p className="text-sm opacity-70">
            Edit & play songs with bit-identical fidelity. Choose a path:
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectivityBadge />
          <DiagnosticsPanel />
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <button onClick={() => navigate("/studio")} className="rounded-xl border p-5 text-left bg-white hover:shadow">
          <div className="font-medium mb-1">Open Studio</div>
          <div className="text-xs opacity-70">Transport, code viewer, integrity badge.</div>
        </button>

        <button onClick={() => navigate("/upload")} className="rounded-xl border p-5 text-left bg-white hover:shadow">
          <div className="font-medium mb-1">Analyze a track</div>
          <div className="text-xs opacity-70">Upload audio → generate ChordCraft code.</div>
        </button>

        <button onClick={() => navigate("/library")} className="rounded-xl border p-5 text-left bg-white hover:shadow">
          <div className="font-medium mb-1">Library</div>
          <div className="text-xs opacity-70">Recent analyses (coming soon).</div>
        </button>
      </div>
    </div>
  );
}
