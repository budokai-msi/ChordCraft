import React from "react";
import { toast } from "sonner";

export default function DiagnosticsPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [diagnostics, setDiagnostics] = React.useState<any>(null);

  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      frontend: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        backendUrl: (import.meta as any).env?.VITE_BACKEND_URL || "Not set",
      },
      network: {},
      errors: []
    };

    try {
      // Test proxy health endpoint
      const healthResponse = await fetch("/api/health");
      results.network.health = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        url: "/api/health"
      };
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        results.network.health.data = data;
      }
    } catch (e: any) {
      results.errors.push(`Health check failed: ${e.message}`);
    }

    try {
      // Test CORS by trying to fetch from same origin
      const corsResponse = await fetch("/api/health", {
        method: "OPTIONS",
        headers: { "Content-Type": "application/json" }
      });
      results.network.cors = {
        status: corsResponse.status,
        ok: corsResponse.ok
      };
    } catch (e: any) {
      results.errors.push(`CORS test failed: ${e.message}`);
    }

    setDiagnostics(results);
    toast.success("Diagnostics complete!");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        🔧 Diagnostics
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Diagnostics</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Run Diagnostics
          </button>
          
          {diagnostics && (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
