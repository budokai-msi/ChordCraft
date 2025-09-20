import React from "react";
import type { Integrity } from "../store/useChordCraftStore";

export function IntegrityBadge({ state, sr, ch, bitDepth }:{
  state: Integrity; sr?: number; ch?: number; bitDepth?: number;
}) {
  if (state === "verifying") return (
    <span className="inline-flex items-center rounded-full bg-gray-300/30 text-gray-700 px-2 py-1 text-xs">
      CHECKING Verifying code integrity
    </span>
  );
  if (state === "ok") return (
    <span className="inline-flex items-center rounded-full bg-green-500/15 text-green-600 px-2 py-1 text-xs">
      VERIFIED Identical {sr ? `• ${Math.round(sr/100)/10}kHz` : ""} {ch ? `• ${ch}ch` : ""} {bitDepth ? `• ${bitDepth}-bit` : ""}
    </span>
  );
  if (state === "mismatch") return (
    <span className="inline-flex items-center rounded-full bg-yellow-500/15 text-yellow-700 px-2 py-1 text-xs">
      MODIFIED Code has been changed
    </span>
  );
  return (
    <span className="inline-flex items-center rounded-full bg-gray-300/30 text-gray-700 px-2 py-1 text-xs">
      — Integrity unknown —
    </span>
  );
}
