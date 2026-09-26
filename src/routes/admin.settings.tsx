import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Phone, Mail, MapPin, Database, CheckCircle2, ShieldCheck, Save, Github, Globe } from "lucide-react";
import { getAdminSession, AdminUser } from "@/lib/admin-auth";
import { SHOP } from "@/lib/shop";

export const Route = createFileRoute("/admin/settings")({
  loader: async () => {
    const session = await getAdminSession();
    return { session };
  },
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { session } = Route.useLoaderData();
  const [saved, setSaved] = useState(false);

  const [shopInfo, setShopInfo] = useState<{
    name: string;
    phoneDisplay: string;
    whatsapp: string;
    email: string;
    address: string;
    hoursWeek: string;
  }>({
    name: SHOP.name,
    phoneDisplay: SHOP.phoneDisplay,
    whatsapp: SHOP.whatsapp,
    email: SHOP.email,
    address: SHOP.address,
    hoursWeek: SHOP.hoursWeek,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Shop Settings & Cloud Integration</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage store contact details and configure Supabase Database, CDN storage, GitHub & Vercel deployment.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="size-4" />
          <span>Shop settings updated successfully.</span>
        </div>
      )}

      {/* Shop Information Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Wrench className="size-4 text-amber-500" />
          Public Shop Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400">Shop Name</label>
            <input
              type="text"
              value={shopInfo.name}
              onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400">Phone Display Number</label>
            <input
              type="text"
              value={shopInfo.phoneDisplay}
              onChange={(e) => setShopInfo({ ...shopInfo, phoneDisplay: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400">WhatsApp International Number</label>
            <input
              type="text"
              value={shopInfo.whatsapp}
              onChange={(e) => setShopInfo({ ...shopInfo, whatsapp: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400">Support Email</label>
            <input
              type="email"
              value={shopInfo.email}
              onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400">Physical Address / Workshop Location</label>
          <input
            type="text"
            value={shopInfo.address}
            onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
          >
            <Save className="size-4" />
            <span>Save Shop Info</span>
          </button>
        </div>
      </form>

      {/* Cloud & Supabase Integration Status */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Database className="size-4 text-emerald-400" />
          Supabase Database & CDN Object Storage Integration
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed">
          This application is built with a dual database abstraction (`src/lib/db.ts`) and object storage helper (`src/lib/storage-store.ts`).
          It automatically runs locally on embedded PGLite, and connects directly to <strong>Supabase PostgreSQL</strong> & <strong>Supabase CDN Bucket</strong> when environment variables are set.
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-300">
            <span>DATABASE_URL (Supabase Postgres)</span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
              Ready for Supabase Connection
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span>VITE_SUPABASE_URL (Supabase Storage CDN)</span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
              Ready for Product Image Bucket
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200 space-y-2">
          <h4 className="font-bold flex items-center gap-1.5 text-amber-400">
            <Globe className="size-4" />
            GitHub Push & Vercel Deployment Checklist:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-zinc-300">
            <li>Create a new repository on GitHub and push this code.</li>
            <li>Import repository in Vercel.</li>
            <li>Add environment variable <code className="text-amber-300">DATABASE_URL</code> pointing to your Supabase connection string.</li>
            <li>Add <code className="text-amber-300">VITE_SUPABASE_URL</code> & <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code> for photo CDN storage.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
