import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "success" | "alert";
};

type NotificationStore = {
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  deleteNotification: (id: string) => void;
  updateNotification: (id: string, title: string, message: string) => void;
  clearAll: () => void;
};

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

function triggerNativePushNotification(title: string, body: string) {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
      });
    } catch (e) {
      console.warn("Native push notification error:", e);
    }
  }
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Welcome to TOOL HUB!",
    message: "Your number one tool station for quality spanners, hydraulic jacks, multimeters & garage equipment.",
    timestamp: "Just now",
    read: false,
    type: "info",
  },
  {
    id: "notif-2",
    title: "New Tools In Stock",
    message: "Heavy-duty 50-Ton Hydraulic Jacks, Ratchet Combination Sets and Digital Multimeters are ready for order.",
    timestamp: "1 hour ago",
    read: false,
    type: "success",
  },
  {
    id: "notif-3",
    title: "Same Day Pickup Available",
    message: "Visit our Nakawa Industrial Area shop or order directly via WhatsApp for boda dispatch across Kampala.",
    timestamp: "Today",
    read: false,
    type: "info",
  },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      addNotification: (item) => {
        triggerNativePushNotification(item.title, item.message);
        set((state) => ({
          notifications: [
            {
              ...item,
              id: `notif-${Date.now()}`,
              timestamp: "Just now",
              read: false,
            },
            ...state.notifications,
          ],
        }));
      },
      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      updateNotification: (id, title, message) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, title, message } : n
          ),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: "toolhub-notifications",
    }
  )
);
