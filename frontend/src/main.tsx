import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AudioEngineProvider } from "./services/AudioEngine";
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AudioEngineProvider>
        <App />
      </AudioEngineProvider>
    </ErrorBoundary>
  </React.StrictMode>
);