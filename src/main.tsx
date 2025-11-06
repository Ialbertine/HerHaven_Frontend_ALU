import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.tsx";
import { processSOSQueue } from "@/utils/offlineSOSQueue";
import "@/i18n/config";

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);

        // Check for updates
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Process offline SOS queue when app starts
if (navigator.onLine) {
  processSOSQueue().catch((err) =>
    console.error("Error processing SOS queue:", err)
  );
}

// Listen for online events to process queue
window.addEventListener("online", () => {
  console.log("App is online, processing SOS queue...");
  processSOSQueue().catch((err) =>
    console.error("Error processing SOS queue:", err)
  );
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
