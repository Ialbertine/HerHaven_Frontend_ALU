/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

interface SOSQueueItem {
  id: string;
  request: {
    location: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
    customNote?: string;
    metadata?: Record<string, string>;
    wasOffline?: boolean;
  };
  token?: string;
  status: "pending" | "syncing" | "synced" | "failed";
  timestamp: number;
  retryCount: number;
}

// Contact Queue Item Interface
interface ContactQueueItem {
  id: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    message: string;
  };
  status: "pending" | "syncing" | "synced" | "failed";
  timestamp: number;
  retryCount: number;
}

// Service Worker event type extensions
interface SyncEvent extends Event {
  tag: string;
  waitUntil(promise: Promise<void>): void;
}

// Precache all assets from the build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// API caching with NetworkFirst strategy (with timeout for offline support)
registerRoute(
  ({ url }) =>
    url.origin === "https://ialbertine-herhaven-backend.onrender.com",
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

// Image caching with CacheFirst strategy
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Static resources with StaleWhileRevalidate
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "static-resources-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
      }),
    ],
  })
);

// Handle background sync events
self.addEventListener("sync", (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === "sos-sync") {
    syncEvent.waitUntil(syncSOSAlerts());
  }
  if (syncEvent.tag === "contact-sync") {
    syncEvent.waitUntil(syncContactMessages());
  }
});

// Sync SOS alerts when online
async function syncSOSAlerts(): Promise<void> {
  try {
    // Get queued SOS alerts from IndexedDB or localStorage
    const sosQueue = await getSOSQueue();

    for (const sosData of sosQueue) {
      if (sosData.status === "pending") {
        try {
          // Attempt to send SOS
          const response = await fetch(
            "https://ialbertine-herhaven-backend.onrender.com/api/sos/trigger",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sosData.token || ""}`,
              },
              body: JSON.stringify(sosData.request),
            }
          );

          if (response.ok) {
            // Mark as synced
            await markSOSAsSynced(sosData.id);

            // Show notification
            await self.registration.showNotification("Emergency Alert Sent", {
              body: "Your emergency contacts have been notified.",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-96x96.png",
              tag: "sos-success",
              requireInteraction: true,
            });
          } else {
            // Increment retry count
            await incrementSOSRetry(sosData.id);
          }
        } catch (error) {
          console.error("Error syncing SOS:", error);
          await incrementSOSRetry(sosData.id);
        }
      }
    }
  } catch (error) {
    console.error("Error in syncSOSAlerts:", error);
  }
}

// Get SOS queue from storage
async function getSOSQueue(): Promise<SOSQueueItem[]> {
  try {
    // Try to get from cache/storage
    const cache = await caches.open("sos-queue");
    const response = await cache.match("/sos-queue-data");

    if (response) {
      return await response.json();
    }

    return [];
  } catch (error) {
    console.error("Error getting SOS queue:", error);
    return [];
  }
}

// Mark SOS as synced
async function markSOSAsSynced(id: string) {
  try {
    const queue = await getSOSQueue();
    const updatedQueue = queue.map((item) =>
      item.id === id ? { ...item, status: "synced" as const } : item
    );
    await saveSOSQueue(updatedQueue);
  } catch (error) {
    console.error("Error marking SOS as synced:", error);
  }
}

// Increment SOS retry count
async function incrementSOSRetry(id: string) {
  try {
    const queue = await getSOSQueue();
    const updatedQueue = queue.map((item) => {
      if (item.id === id) {
        const retryCount = (item.retryCount || 0) + 1;
        const status: SOSQueueItem["status"] =
          retryCount >= 3 ? "failed" : "pending";
        return {
          ...item,
          retryCount,
          status,
        };
      }
      return item;
    });
    await saveSOSQueue(updatedQueue);
  } catch (error) {
    console.error("Error incrementing SOS retry:", error);
  }
}

// Save SOS queue to storage
async function saveSOSQueue(queue: SOSQueueItem[]): Promise<void> {
  try {
    const cache = await caches.open("sos-queue");
    await cache.put(
      "/sos-queue-data",
      new Response(JSON.stringify(queue), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    console.error("Error saving SOS queue:", error);
  }
}

// Handle push notifications for emergency alerts
self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json() || {};

  if (data.type === "sos-alert") {
    event.waitUntil(
      self.registration.showNotification("Emergency Alert", {
        body: data.message || "An emergency alert has been triggered.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png",
        tag: "emergency-alert",
        requireInteraction: true,
      })
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow("/emergency-sos"));
  }
});

// Install event
self.addEventListener("install", () => {
  void self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

// Handle messages from clients
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }

  if (event.data && event.data.type === "QUEUE_SOS") {
    // Queue SOS for background sync
    event.waitUntil(queueSOSForSync(event.data.payload));
  }
});

// Queue SOS for background sync
async function queueSOSForSync(sosData?: SOSQueueItem): Promise<void> {
  if (!sosData) return;

  try {
    const queue = await getSOSQueue();
    const newItem: SOSQueueItem = {
      ...sosData,
      id: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(newItem);
    await saveSOSQueue(queue);

    // Register sync
    if ("sync" in self.registration) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (self.registration as any).sync.register("sos-sync");
    }
  } catch (error) {
    console.error("Error queueing SOS:", error);
  }
}

// Sync contact messages when online
async function syncContactMessages(): Promise<void> {
  try {
    const contactQueue = await getContactQueue();

    for (const message of contactQueue) {
      if (message.status === "pending") {
        try {
          // Attempt to send contact message
          const response = await fetch(
            "https://ialbertine-herhaven-backend.onrender.com/api/contact/messages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(message.data),
            }
          );

          if (response.ok) {
            // Mark as synced
            await markContactAsSynced(message.id);

            // Show notification
            await self.registration.showNotification("Message Sent", {
              body: "Your contact message has been delivered successfully.",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-96x96.png",
              tag: "contact-success",
            });
          } else {
            // Increment retry count
            await incrementContactRetry(message.id);
          }
        } catch (error) {
          console.error("Error syncing contact message:", error);
          await incrementContactRetry(message.id);
        }
      }
    }
  } catch (error) {
    console.error("Error in syncContactMessages:", error);
  }
}

// Get contact queue from storage
async function getContactQueue(): Promise<ContactQueueItem[]> {
  try {
    const cache = await caches.open("contact-queue");
    const response = await cache.match("/contact-queue-data");

    if (response) {
      return await response.json();
    }

    return [];
  } catch (error) {
    console.error("Error getting contact queue:", error);
    return [];
  }
}

// Mark contact message as synced
async function markContactAsSynced(id: string) {
  try {
    const queue = await getContactQueue();
    const updatedQueue = queue.map((item) =>
      item.id === id ? { ...item, status: "synced" as const } : item
    );
    await saveContactQueue(updatedQueue);
  } catch (error) {
    console.error("Error marking contact as synced:", error);
  }
}

// Increment contact message retry count
async function incrementContactRetry(id: string) {
  try {
    const queue = await getContactQueue();
    const updatedQueue = queue.map((item) => {
      if (item.id === id) {
        const retryCount = (item.retryCount || 0) + 1;
        const status: ContactQueueItem["status"] =
          retryCount >= 3 ? "failed" : "pending";
        return {
          ...item,
          retryCount,
          status,
        };
      }
      return item;
    });
    await saveContactQueue(updatedQueue);
  } catch (error) {
    console.error("Error incrementing contact retry:", error);
  }
}

// Save contact queue to storage
async function saveContactQueue(queue: ContactQueueItem[]): Promise<void> {
  try {
    const cache = await caches.open("contact-queue");
    await cache.put(
      "/contact-queue-data",
      new Response(JSON.stringify(queue), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    console.error("Error saving contact queue:", error);
  }
}
