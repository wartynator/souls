import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import App from "./App.jsx";
import "./styles.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  // Fail loudly during dev if the env var is missing — easier to diagnose.
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_CONVEX_URL. Copy .env.local.example to .env.local and fill it in.",
  );
}

const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </React.StrictMode>,
);

// Register PWA service worker (production only — skip during `vite dev` to
// avoid aggressive caching while developing).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW registration failed:", err));
  });
}
