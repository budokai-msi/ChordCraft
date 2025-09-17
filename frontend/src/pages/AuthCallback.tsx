import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Exchanges ?code= for a session and sets cookies/local storage
        await supabase.auth.exchangeCodeForSession();
        navigate("/", { replace: true });
      } catch (e) {
        console.error("Auth callback error:", e);
        // fall back to home; your ErrorBoundary will show details if needed
        navigate("/", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center text-sm opacity-70">
      Completing sign-in…
    </div>
  );
}
