import React from "react";
import { useChordCraftStore } from "../store/useChordCraftStore";

export default function ConnectivityBadge() {
  const backendUrl = useChordCraftStore(s => s.backendUrl);
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [msg, setMsg] = React.useState("");

  React.useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const r = await fetch(`${backendUrl.replace(/\/$/,"")}/health`, { method: "GET", mode: "cors" });
        if (aborted) return;
        setOk(r.ok);
        setMsg(r.ok ? "Backend online" : `Health ${r.status}`);
      } catch (e: any) {
        if (aborted) return;
        setOk(false);
        setMsg("Network/CORS blocked");
      }
    })();
    return () => { aborted = true; };
  }, [backendUrl]);

  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs";
  if (ok === null) return <span className={`${base} bg-gray-300/30 text-gray-700`}>Checking…</span>;
  if (ok) return <span className={`${base} bg-emerald-500/15 text-emerald-600`}>✅ {msg}</span>;
  return <span className={`${base} bg-amber-500/15 text-amber-700`}>⚠️ {msg}</span>;
}
