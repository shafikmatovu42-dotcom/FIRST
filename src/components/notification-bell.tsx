import { useState } from "react";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useNotificationStore } from "@/lib/notification-store";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[0.625rem] font-bold text-zinc-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-amber-500" />
              <h4 className="font-display text-sm font-semibold tracking-wide">Notifications</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-elevated hover:text-foreground transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3.5" />
                  <span>Read all</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No notifications at this time.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`group relative flex gap-3 rounded-xl p-3 transition cursor-pointer ${
                    n.read ? "bg-card hover:bg-elevated/50 opacity-70" : "bg-elevated/90 border border-amber-500/20 hover:bg-elevated"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === "success" ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : n.type === "alert" ? (
                      <AlertTriangle className="size-4 text-amber-400" />
                    ) : (
                      <Info className="size-4 text-steel" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="absolute top-3 right-3 size-2 rounded-full bg-amber-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
