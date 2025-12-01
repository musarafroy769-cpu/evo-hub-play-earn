import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Monetag service workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw_2.js').catch(() => {
      // Silent fail - service worker registration is optional
    });
    navigator.serviceWorker.register('/sw_3.js').catch(() => {
      // Silent fail - service worker registration is optional
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
