import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export type ActivityLog = {
  id: number;
  admin_username: string;
  action: string;
  details: string;
  type: string;
  created_at: string;
};

export const listActivityLogs = createServerFn({ method: "GET" }).handler(
  async (): Promise<ActivityLog[]> => {
    const session = await getAdminSession();
    if (!session) {
      return [];
    }

    const sql = await getSql();
    return sql.query<ActivityLog>(
      `select id, admin_username, action, details, type, created_at 
       from activity_logs 
       order by created_at desc 
       limit 100`,
    );
  },
);
