import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, ShoppingBag, DollarSign, AlertTriangle, ArrowUpRight, Clock, Plus, CheckCircle2 } from "lucide-react";
import { listProducts, Product } from "@/lib/catalog";
import { listOrders, Order } from "@/lib/admin-orders";
import { listActivityLogs, ActivityLog } from "@/lib/admin-activity";
import { formatUgx } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [products, orders, logs] = await Promise.all([
      listProducts(),
      listOrders(),
      listActivityLogs(),
    ]);
    return { products, orders, logs };
  },
  component: AdminDashboardIndex,
});

function AdminDashboardIndex() {
  const { products, orders, logs } = Route.useLoaderData();

  // Compute metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= 3);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const estimatedRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total_ugx, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Welcome back to Tool Hub admin panel. Here is your store summary.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Products</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Package className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{totalProducts}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>In catalog</span>
            <Link to="/admin/products" className="flex items-center gap-1 text-amber-400 hover:underline">
              Manage <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Low Stock Alert</span>
            <div className={`flex size-9 items-center justify-center rounded-xl ${lowStockProducts.length > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{lowStockProducts.length}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Items ≤ 3 units</span>
            <Link to="/admin/products" className="flex items-center gap-1 text-amber-400 hover:underline">
              Restock <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Orders</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <ShoppingBag className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{totalOrders}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span className="text-amber-400 font-semibold">{pendingOrders.length} pending</span>
            <Link to="/admin/orders" className="flex items-center gap-1 text-amber-400 hover:underline">
              View orders <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Est. Revenue</span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="size-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">{formatUgx(estimatedRevenue)}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>All valid orders</span>
            <span className="text-emerald-400 font-medium">UGX Total</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Activity Feed */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
              <p className="text-xs text-zinc-400">Latest orders placed via website or checkout</p>
            </div>
            <Link
              to="/admin/orders"
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
            >
              View All Orders
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No orders placed yet. Orders will appear here automatically when customers check out.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">#{order.order_ref}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        order.status === "Pending" ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" :
                        order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" :
                        order.status === "Cancelled" ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20" :
                        "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="truncate text-xs font-medium text-white mt-0.5">{order.customer_name} • {order.customer_phone}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{order.delivery_location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{formatUgx(order.total_ugx)}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning + Recent Logs (1 col) */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Low Stock Items
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Items needing restock</p>

            <div className="mt-4 space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
                  <CheckCircle2 className="size-4" />
                  <span>All product stock levels are healthy!</span>
                </div>
              ) : (
                lowStockProducts.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">{item.brand} • {item.category_slug}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-400 ring-1 ring-red-500/20">
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed Widget */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="size-4 text-amber-500" />
                Recent Logs
              </h2>
              <Link to="/admin/activity" className="text-xs text-amber-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-3 divide-y divide-zinc-800/40 text-xs">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5">
                  <p className="font-semibold text-zinc-200">{log.action}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">@{log.admin_username} • {new Date(log.created_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
