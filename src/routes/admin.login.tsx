import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Lock, User, ArrowRight, ShieldCheck, Wrench, AlertCircle } from "lucide-react";
import { adminLogin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both username and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminLogin({ data: { username: username.trim(), password } });
      if (res.success) {
        navigate({ to: "/admin" });
      } else {
        setError(res.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
            <Wrench className="size-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">TOOL HUB Admin Portal</h2>
          <p className="mt-1 text-sm text-zinc-400">Sign in to manage your inventory, orders, and shop settings.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Username or Email
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <User className="size-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or owner@toolhub.ug"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="size-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-400">
            <span className="font-semibold text-amber-400">Default Credentials:</span>
            <div className="mt-1 flex justify-between font-mono text-[11px]">
              <span>Username: <strong className="text-zinc-200">admin</strong></span>
              <span>Password: <strong className="text-zinc-200">password123</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-amber-500 py-3 px-4 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-amber-400 focus:outline-none disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-400">
          Need a new owner account?{" "}
          <Link to="/admin/register" className="font-semibold text-amber-400 hover:underline">
            Create Owner Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="size-3.5 text-amber-500" />
          <span>Encrypted Session • TOOL HUB Admin System</span>
        </div>
      </div>
    </div>
  );
}
