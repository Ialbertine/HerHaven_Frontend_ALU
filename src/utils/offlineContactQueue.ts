export interface QueuedContactMessage {
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

const CONTACT_QUEUE_KEY = "herhaven_contact_queue";

// Get all queued contact messages from localStorage
export const getContactQueue = (): QueuedContactMessage[] => {
  try {
    const queueData = localStorage.getItem(CONTACT_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  } catch (error) {
    console.error("Error reading contact queue:", error);
    return [];
  }
};

// Save contact queue to localStorage
export const saveContactQueue = (queue: QueuedContactMessage[]): void => {
  try {
    localStorage.setItem(CONTACT_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Error saving contact queue:", error);
  }
};

// Add a new contact message to the queue
export const queueContactMessage = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
}): string => {
  const queue = getContactQueue();
  const messageId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const queuedMessage: QueuedContactMessage = {
    id: messageId,
    data,
    status: "pending",
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(queuedMessage);
  saveContactQueue(queue);

  // Register background sync if available
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if ("sync" in registration) {
          const syncCapableRegistration = registration as ServiceWorkerRegistration & {
            sync: {
              register: (tag: string) => Promise<void>;
            };
          };
          return syncCapableRegistration.sync.register("contact-sync");
        }
        return undefined;
      })
      .catch((error) => {
        console.error("Error registering background sync:", error);
      });
  }

  return messageId;
};

// Process the contact queue
export const processContactQueue = async (): Promise<void> => {
  const queue = getContactQueue();
  const pendingMessages = queue.filter((msg) => msg.status === "pending");

  if (pendingMessages.length === 0) {
    return;
  }

  console.log(`Processing ${pendingMessages.length} queued contact messages...`);

  for (const message of pendingMessages) {
    try {
      // Update status to syncing
      updateMessageStatus(message.id, "syncing");

      // Send the message using fetch
      const response = await fetch(
        `${import.meta.env.VITE_REACT_API_URL || 'https://ialbertine-herhaven-backend.onrender.com'}/api/contact/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(message.data),
        }
      );

      if (response.ok) {
        // Mark as synced
        updateMessageStatus(message.id, "synced");
        console.log(`Contact message ${message.id} sent successfully`);
        
        // Remove synced messages after a delay
        setTimeout(() => {
          removeMessageFromQueue(message.id);
        }, 5000);
      } else {
        incrementMessageRetry(message.id);
      }
    } catch {
      incrementMessageRetry(message.id);
    }
  }
};

// Update message status
const updateMessageStatus = (
  messageId: string,
  status: QueuedContactMessage["status"]
): void => {
  const queue = getContactQueue();
  const updatedQueue = queue.map((msg) =>
    msg.id === messageId ? { ...msg, status } : msg
  );
  saveContactQueue(updatedQueue);
};

// Increment retry count for a message
const incrementMessageRetry = (messageId: string): void => {
  const queue = getContactQueue();
  const updatedQueue = queue.map((msg) => {
    if (msg.id === messageId) {
      const retryCount = msg.retryCount + 1;
      const status: QueuedContactMessage["status"] =
        retryCount >= 3 ? "failed" : "pending";
      return {
        ...msg,
        retryCount,
        status,
      };
    }
    return msg;
  });
  saveContactQueue(updatedQueue);
};

// Remove a message from the queue
const removeMessageFromQueue = (messageId: string): void => {
  const queue = getContactQueue();
  const updatedQueue = queue.filter((msg) => msg.id !== messageId);
  saveContactQueue(updatedQueue);
};

// Get count of pending messages
export const getPendingContactCount = (): number => {
  const queue = getContactQueue();
  return queue.filter((msg) => msg.status === "pending").length;
};

// Clear all synced and failed messages
export const cleanupContactQueue = (): void => {
  const queue = getContactQueue();
  const activeQueue = queue.filter(
    (msg) => msg.status === "pending" || msg.status === "syncing"
  );
  saveContactQueue(activeQueue);
};

