import React from "react";

export default function ConnectivityBadge() {
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [msg, setMsg] = React.useState("");

  React.useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        // Use proxy URL for production (no CORS issues)
        const r = await fetch("/api/health", { method: "GET" });
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
  }, []);

  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs";
  if (ok === null) return <span className={`${base} bg-gray-300/30 text-gray-700`}>Checking…</span>;
  if (ok) return <span className={`${base} bg-emerald-500/15 text-emerald-600`}>✅ {msg}</span>;
  return <span className={`${base} bg-amber-500/15 text-amber-700`}>⚠️ {msg}</span>;
}
