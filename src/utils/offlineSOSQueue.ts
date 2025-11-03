import type { TriggerSOSRequest } from "@/types/sos";

const SOS_QUEUE_KEY = "herhaven_sos_queue";
const SYNC_TAG = "sos-sync";

// Extended ServiceWorkerRegistration with sync API
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: SyncManager;
}

export interface OfflineSOSData {
  id: string;
  request: TriggerSOSRequest;
  timestamp: number;
  retryCount: number;
  status: "pending" | "syncing" | "synced" | "failed";
}

// Get SOS queue from localStorage
export const getSOSQueue = (): OfflineSOSData[] => {
  try {
    const queue = localStorage.getItem(SOS_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error("Error reading SOS queue:", error);
    return [];
  }
};

// Save SOS queue to localStorage
export const saveSOSQueue = (queue: OfflineSOSData[]): void => {
  try {
    localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Error saving SOS queue:", error);
  }
};

// Add SOS to offline queue
export const queueOfflineSOS = (request: TriggerSOSRequest): string => {
  const queue = getSOSQueue();
  const id = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const sosData: OfflineSOSData = {
    id,
    request,
    timestamp: Date.now(),
    retryCount: 0,
    status: "pending",
  };

  queue.push(sosData);
  saveSOSQueue(queue);

  // Register background sync if available
  if (
    "serviceWorker" in navigator &&
    "sync" in ServiceWorkerRegistration.prototype
  ) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if ("sync" in registration) {
          (registration as ServiceWorkerRegistrationWithSync).sync.register(
            SYNC_TAG
          );
        }
      })
      .catch((err) => console.error("Failed to register sync:", err));
  }

  return id;
};

// Process SOS queue when online
export const processSOSQueue = async (): Promise<void> => {
  const queue = getSOSQueue();
  const pendingItems = queue.filter((item) => item.status === "pending");

  if (pendingItems.length === 0) return;

  // Import triggerSOS dynamically to avoid circular dependencies
  const { triggerSOS } = await import("@/apis/sos");

  for (const item of pendingItems) {
    try {
      // Update status to syncing
      item.status = "syncing";
      saveSOSQueue(queue);

      // Attempt to send SOS
      const response = await triggerSOS(item.request);

      if (response.success) {
        item.status = "synced";
        console.log(`SOS ${item.id} synced successfully`);
      } else {
        item.retryCount++;
        if (item.retryCount >= 3) {
          item.status = "failed";
          console.error(`SOS ${item.id} failed after 3 retries`);
        } else {
          item.status = "pending";
          console.log(`SOS ${item.id} retry ${item.retryCount}`);
        }
      }
    } catch (error) {
      console.error(`Error processing SOS ${item.id}:`, error);
      item.retryCount++;
      if (item.retryCount >= 3) {
        item.status = "failed";
      } else {
        item.status = "pending";
      }
    }

    saveSOSQueue(queue);
  }

  // Clean up synced items older than 24 hours
  const now = Date.now();
  const cleanedQueue = queue.filter((item) => {
    if (item.status === "synced") {
      return now - item.timestamp < 24 * 60 * 60 * 1000;
    }
    return true; 
  });

  saveSOSQueue(cleanedQueue);
};

// Get SOS queue status
export const getSOSQueueStatus = () => {
  const queue = getSOSQueue();
  return {
    total: queue.length,
    pending: queue.filter((item) => item.status === "pending").length,
    syncing: queue.filter((item) => item.status === "syncing").length,
    synced: queue.filter((item) => item.status === "synced").length,
    failed: queue.filter((item) => item.status === "failed").length,
  };
};

// Clear synced items from queue
export const clearSyncedItems = (): void => {
  const queue = getSOSQueue();
  const activeQueue = queue.filter((item) => item.status !== "synced");
  saveSOSQueue(activeQueue);
};

// Listen for online event and process queue
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Device is online, processing SOS queue...");
    processSOSQueue();
  });
}
