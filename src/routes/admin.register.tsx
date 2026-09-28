import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Lock, User, Mail, UserCheck, ArrowRight, ShieldCheck, Wrench, AlertCircle, ShieldAlert } from "lucide-react";
import { adminRegister, checkHasAdminUser } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/register")({
  loader: async () => {
    const { hasAdmin, count } = await checkHasAdminUser();
    return { hasAdmin, count };
  },
  component: AdminRegisterPage,
});

function AdminRegisterPage() {
  const { hasAdmin } = Route.useLoaderData();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminRegister({
        data: {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        },
      });

      if (res.success) {
        window.location.href = "/admin";
      } else {
        setError(res.error || "Registration failed");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (hasAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Owner Account Initialized</h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              An active Shop Owner account already exists for this store. Public registration is locked to protect your database.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300 text-left space-y-1">
            <p className="font-semibold text-white">Need Portal Access?</p>
            <p className="text-zinc-400">
              - If you are the Shop Owner, sign in with your credentials.
              - If you are a Staff member, ask your Shop Owner to add a Staff account for you in <strong>Shop Settings</strong>.
            </p>
          </div>

          <Link
            to="/admin/login"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 px-4 text-sm font-bold text-zinc-950 hover:bg-amber-400"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
            <Wrench className="size-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Create Owner Account</h2>
          <p className="mt-1 text-sm text-zinc-400">Register as the primary shop administrator to manage inventory & orders.</p>
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
              Full Name
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <UserCheck className="size-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Kampala"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Username
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
                placeholder="e.g. shopowner2"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="size-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.ug"
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
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
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
                Registering...
              </span>
            ) : (
              <>
                <span>Create Owner Account</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link to="/admin/login" className="font-semibold text-amber-400 hover:underline">
            Sign In Here
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="size-3.5 text-amber-500" />
          <span>TOOL HUB Secure Registration</span>
        </div>
      </div>
    </div>
  );
}
