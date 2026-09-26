import { useEffect, useState } from "react";
import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  Wrench,
  User,
  ShieldCheck,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { getAdminSession, adminLogout, AdminUser } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  loader: async () => {
    try {
      const session = await getAdminSession();
      return { session };
    } catch {
      return { session: null };
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = Route.useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AdminUser | null>(session);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!session && !location.pathname.includes("/admin/login") && !location.pathname.includes("/admin/register")) {
      navigate({ to: "/admin/login" });
    } else {
      setUser(session);
    }
  }, [session, location.pathname, navigate]);

  if (location.pathname.includes("/admin/login") || location.pathname.includes("/admin/register")) {
    return <Outlet />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="size-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="text-sm font-medium">Checking authorization...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await adminLogout();
    navigate({ to: "/admin/login" });
  };

  // Role-based navigation filtering
  const allNavItems = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard, exact: true, roles: ["owner", "staff"] },
    { label: "Products", to: "/admin/products", icon: Package, roles: ["owner", "staff"] },
    { label: "Customer Orders", to: "/admin/orders", icon: ShoppingBag, roles: ["owner", "staff"] },
    { label: "Activity History", to: "/admin/activity", icon: History, roles: ["owner"] },
    { label: "Shop Settings", to: "/admin/settings", icon: Settings, roles: ["owner"] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(user.role || "owner"));

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 border-r border-zinc-800 bg-zinc-900/95 flex flex-col justify-between backdrop-blur-md transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Brand Logo & Collapse Toggle Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 shadow-md">
                <Wrench className="size-5" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <h1 className="text-base font-bold tracking-tight text-white">TOOL HUB</h1>
                  <p className="text-[11px] font-medium text-amber-500 uppercase tracking-widest">
                    {user.role === "owner" ? "Owner Portal" : "Staff Portal"}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="flex size-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-amber-500 hover:text-white"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 font-semibold shadow-md"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="border-t border-zinc-800 p-3 space-y-3">
          <div className={`flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 ${collapsed ? "justify-center" : ""}`}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <User className="size-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{user.name}</p>
                <p className="truncate text-[10px] text-amber-400 font-medium">@{user.username} • {user.role}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/shop"
              target="_blank"
              title="View Storefront"
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white ${
                collapsed ? "px-0" : ""
              }`}
            >
              <ExternalLink className="size-3.5" />
              {!collapsed && <span>Storefront</span>}
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "pl-20" : "pl-64"}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700"
            >
              <Menu className="size-3.5" />
              <span>{collapsed ? "Expand Menu" : "Collapse Menu"}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Database Status: <strong className="text-zinc-200 font-mono">PGLite / Supabase Ready</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition"
            >
              <Plus className="size-3.5" />
              <span>Add Product</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
