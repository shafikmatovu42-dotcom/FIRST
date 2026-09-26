import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export type OrderItem = {
  productId: number;
  slug: string;
  name: string;
  price_ugx: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: number;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_location: string;
  items_json: string;
  total_ugx: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export const listOrders = createServerFn({ method: "GET" }).handler(
  async (): Promise<Order[]> => {
    const session = await getAdminSession();
    if (!session) {
      return [];
    }

    const sql = await getSql();
    return sql.query<Order>(
      `select id, order_ref, customer_name, customer_phone, customer_email, delivery_location, items_json, total_ugx, status, notes, created_at 
       from orders 
       order by created_at desc`,
    );
  },
);

export const createOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      order_ref: z.string(),
      customer_name: z.string().min(2, "Customer name is required"),
      customer_phone: z.string().min(6, "Phone number is required"),
      customer_email: z.string().email().optional().or(z.literal("")),
      delivery_location: z.string().min(2, "Delivery location is required"),
      items: z.array(
        z.object({
          productId: z.number(),
          slug: z.string(),
          name: z.string(),
          price_ugx: z.number(),
          quantity: z.number(),
          image: z.string(),
        }),
      ),
      total_ugx: z.number(),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const itemsJson = JSON.stringify(data.items);

    try {
      const rows = await sql.query<Order>(
        `insert into orders (order_ref, customer_name, customer_phone, customer_email, delivery_location, items_json, total_ugx, status, notes)
         values ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8)
         returning id, order_ref, customer_name, customer_phone, customer_email, delivery_location, items_json, total_ugx, status, notes, created_at`,
        [
          data.order_ref,
          data.customer_name,
          data.customer_phone,
          data.customer_email || null,
          data.delivery_location,
          itemsJson,
          data.total_ugx,
          data.notes || null,
        ],
      );

      // Log order creation
      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [
          "customer",
          "New Order Placed",
          `Order #${data.order_ref} placed by ${data.customer_name} (${data.customer_phone}) for UGX ${data.total_ugx.toLocaleString()}.`,
          "orders",
        ],
      );

      return { success: true, order: rows[0] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      return { success: false, error: msg };
    }
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number().positive(),
      status: z.enum(["Pending", "Contacted", "Shipped", "Delivered", "Cancelled"]),
      notes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const sql = await getSql();

    try {
      const rows = await sql.query<Order>(
        `update orders set status = $1, notes = coalesce($2, notes) where id = $3
         returning id, order_ref, customer_name, customer_phone, customer_email, delivery_location, items_json, total_ugx, status, notes, created_at`,
        [data.status, data.notes || null, data.id],
      );

      if (rows.length === 0) {
        return { success: false, error: "Order not found" };
      }

      const order = rows[0];

      // Log activity
      await sql.query(
        `insert into activity_logs (admin_username, action, details, type) values ($1, $2, $3, $4)`,
        [
          session.username,
          "Order Status Changed",
          `Order #${order.order_ref} status updated to '${data.status}' by ${session.name}.`,
          "orders",
        ],
      );

      return { success: true, order };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      return { success: false, error: msg };
    }
  });
