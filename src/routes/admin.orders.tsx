import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ShoppingBag, Phone, MapPin, Calendar, CheckCircle2, Clock, X, MessageSquare, Filter } from "lucide-react";
import { listOrders, updateOrderStatus, Order, OrderItem } from "@/lib/admin-orders";
import { formatUgx } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  loader: async () => {
    const orders = await listOrders();
    return { orders };
  },
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const router = useRouter();
  const { orders } = Route.useLoaderData();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<"Pending" | "Contacted" | "Shipped" | "Delivered" | "Cancelled">("Pending");
  const [adminNotes, setAdminNotes] = useState<string>("");

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status as any);
    setAdminNotes(order.notes || "");
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingId(selectedOrder.id);

    const res = await updateOrderStatus({
      data: {
        id: selectedOrder.id,
        status: newStatus,
        notes: adminNotes,
      },
    });

    if (res.success) {
      setSelectedOrder(null);
      router.invalidate();
    } else {
      alert("Failed to update status");
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Customer Orders Management</h1>
        <p className="mt-1 text-sm text-zinc-400">Review incoming customer checkout orders, track status, and dispatch parts.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
        {["all", "Pending", "Contacted", "Shipped", "Delivered", "Cancelled"].map((status) => {
          const count = status === "all" ? orders.length : orders.filter((o) => o.status === status).length;
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-md"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span>{status === "all" ? "All Orders" : status}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-zinc-950 text-amber-400" : "bg-zinc-800 text-zinc-300"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Order Ref</th>
              <th className="px-6 py-4">Customer Info</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No orders found for this status.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-zinc-800/40">
                  <td className="px-6 py-4 font-mono font-bold text-amber-400">
                    #{order.order_ref}
                    <p className="font-sans text-[10px] font-normal text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{order.customer_name}</p>
                    <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-xs text-amber-400 hover:underline">
                      <Phone className="size-3" />
                      <span>{order.customer_phone}</span>
                    </a>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-300 max-w-[200px] truncate">
                    {order.delivery_location}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {formatUgx(order.total_ugx)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.status === "Pending"
                          ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                          : order.status === "Delivered"
                          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                          : order.status === "Cancelled"
                          ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
                          : "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(order)}
                      className="rounded-xl bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-amber-500 hover:text-zinc-950"
                    >
                      View & Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Order #{selectedOrder.order_ref} Details</h3>
                <p className="text-xs text-zinc-400">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 text-xs">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider">Customer Contact</h4>
              <p className="text-sm font-semibold text-white">{selectedOrder.customer_name}</p>
              <div className="flex items-center gap-4 text-zinc-300">
                <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1.5 text-amber-400 font-semibold hover:underline">
                  <Phone className="size-3.5" />
                  <span>{selectedOrder.customer_phone}</span>
                </a>
                {selectedOrder.customer_email && <span>{selectedOrder.customer_email}</span>}
              </div>
              <div className="flex items-start gap-1.5 text-zinc-400 pt-1">
                <MapPin className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{selectedOrder.delivery_location}</span>
              </div>
            </div>

            {/* Purchased Items List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Purchased Spare Parts</h4>
              <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                {(() => {
                  try {
                    const items: OrderItem[] = JSON.parse(selectedOrder.items_json);
                    return items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800" />
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-zinc-500">{formatUgx(item.price_ugx)} x {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-bold text-white">{formatUgx(item.price_ugx * item.quantity)}</p>
                      </div>
                    ));
                  } catch {
                    return <p className="text-xs text-zinc-500 p-2">Items detail format error</p>;
                  }
                })()}
              </div>

              <div className="flex items-center justify-between pt-3 px-1">
                <span className="text-xs font-semibold text-zinc-400">Total Order Amount:</span>
                <span className="text-base font-extrabold text-amber-400">{formatUgx(selectedOrder.total_ugx)}</span>
              </div>
            </div>

            {/* Update Status & Notes */}
            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Update Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Pending">Pending (Newly Received)</option>
                  <option value="Contacted">Contacted (Customer Called via Phone/WhatsApp)</option>
                  <option value="Shipped">Shipped / Dispatched for Delivery</option>
                  <option value="Delivered">Delivered & Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Dispatched rider via Nakawa junction..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={updatingId !== null}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {updatingId !== null ? "Saving..." : "Save Order Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
