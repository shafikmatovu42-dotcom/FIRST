import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History, User, Clock, ShieldAlert, Package, ShoppingBag, Lock, Filter } from "lucide-react";
import { listActivityLogs, ActivityLog } from "@/lib/admin-activity";

export const Route = createFileRoute("/admin/activity")({
  loader: async () => {
    const logs = await listActivityLogs();
    return { logs };
  },
  component: AdminActivityPage,
});

function AdminActivityPage() {
  const { logs } = Route.useLoaderData();
  const [filterType, setFilterType] = useState<string>("all");

  const filteredLogs = logs.filter((l) => {
    if (filterType === "all") return true;
    return l.type === filterType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Activity & Audit History</h1>
        <p className="mt-1 text-sm text-zinc-400">Complete log of admin changes, inventory updates, order statuses, and logins.</p>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
        {["all", "catalog", "orders", "auth", "system"].map((type) => {
          const isActive = filterType === type;
          const count = type === "all" ? logs.length : logs.filter((l) => l.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition ${
                isActive
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span>{type === "all" ? "All Activity Logs" : type}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-zinc-950 text-amber-400" : "bg-zinc-800 text-zinc-300"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Logs Feed */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No activity logged yet for this category.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filteredLogs.map((log) => {
              const LogIcon =
                log.type === "catalog" ? Package :
                log.type === "orders" ? ShoppingBag :
                log.type === "auth" ? Lock : History;

              return (
                <div key={log.id} className="flex items-start gap-4 p-5 transition hover:bg-zinc-800/30">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-amber-400">
                    <LogIcon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{log.action}</h3>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0 font-mono">
                        <Clock className="size-3 text-zinc-500" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300">{log.details}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                      <User className="size-3 text-zinc-500" />
                      <span>Performed by <strong className="text-zinc-400">@{log.admin_username}</strong></span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] uppercase font-bold text-zinc-400">
                        {log.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
