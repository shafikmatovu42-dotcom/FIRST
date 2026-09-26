import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Wrench,
  Phone,
  Mail,
  MapPin,
  Database,
  CheckCircle2,
  ShieldCheck,
  Save,
  Globe,
  Upload,
  Plus,
  Trash2,
  UserPlus,
  Users,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getAdminSession, listStaffUsers, createStaffUser, deleteStaffUser, AdminUser } from "@/lib/admin-auth";
import { listCategories, Category } from "@/lib/catalog";
import { createCategory, deleteCategory, getShopSettings, updateShopSettings } from "@/lib/admin-catalog";
import { uploadProductImage } from "@/lib/storage-store";
import { SHOP } from "@/lib/shop";

export const Route = createFileRoute("/admin/settings")({
  loader: async () => {
    const [session, staffList, categoriesList, dbSettings] = await Promise.all([
      getAdminSession(),
      listStaffUsers(),
      listCategories(),
      getShopSettings(),
    ]);
    return { session, staffList, categoriesList, dbSettings };
  },
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { session, staffList, categoriesList, dbSettings } = Route.useLoaderData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "categories" | "staff" | "cloud">("profile");

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showFeedback = (fb: { type: "success" | "error"; text: string } | null) => {
    setFeedback(fb);
    if (fb && fb.type === "success") {
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // 1. Shop Info & App Logo State
  const [shopInfo, setShopInfo] = useState({
    name: dbSettings.store_name || SHOP.name,
    logo: dbSettings.store_logo || "/favicon.svg",
    phoneDisplay: dbSettings.store_phone || SHOP.phoneDisplay,
    whatsapp: dbSettings.store_whatsapp || SHOP.whatsapp,
    email: dbSettings.store_email || SHOP.email,
    address: dbSettings.store_address || SHOP.address,
    hoursWeek: dbSettings.store_hours || SHOP.hoursWeek,
    heroTitle: dbSettings.hero_title || "Japanese and European parts. On the shelf.",
    heroSubtitle: dbSettings.hero_subtitle || "Spare parts for Japanese and European vehicles. Headlamps, taillamps, grills and workshop fluids — priced in UGX, ready for pickup or WhatsApp order.",
    heroImage: dbSettings.hero_image || "/parts/workshop.jpg",
    heroLocationTag: dbSettings.hero_location_tag || "NAKAWA, KAMPALA",
  });

  // 2. Category Form State
  const [catFormData, setCatFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    sort_order: categoriesList.length + 1,
  });

  // 3. Staff User Form State
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "staff" as "owner" | "staff",
  });

  // 4. Header Categories State (3 categories displayed in site header)
  const initialHeaderCats = dbSettings.header_categories
    ? dbSettings.header_categories.split(",").map((s) => s.trim()).filter(Boolean)
    : ["headlamps", "taillamps", "body-parts"];

  const [headerCategories, setHeaderCategories] = useState<string[]>(initialHeaderCats);

  const toggleHeaderCategory = (slug: string) => {
    const exists = headerCategories.some((s) => s.toLowerCase() === slug.toLowerCase());
    if (exists) {
      setHeaderCategories(headerCategories.filter((s) => s.toLowerCase() !== slug.toLowerCase()));
    } else {
      if (headerCategories.length >= 3) {
        // Drop the first selected category and append the new one (rolling 3 selection)
        setHeaderCategories([...headerCategories.slice(1), slug]);
      } else {
        setHeaderCategories([...headerCategories, slug]);
      }
    }
  };

  const handleSaveHeaderCategories = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (headerCategories.length === 0 || headerCategories.length > 3) {
      showFeedback({ type: "error", text: "Please select between 1 and 3 categories to display in the top header menu." });
      return;
    }

    setSubmitting(true);
    showFeedback(null);

    try {
      const res = await updateShopSettings({
        data: {
          settings: {
            header_categories: headerCategories.join(","),
          },
        },
      });

      if (res?.success) {
        showFeedback({ type: "success", text: `Top Header navigation updated with ${headerCategories.length} category link(s)!` });
        router.invalidate();
      } else {
        showFeedback({ type: "error", text: res?.error || "Failed to save header categories." });
      }
    } catch {
      showFeedback({ type: "error", text: "Error saving header categories." });
    } finally {
      setSubmitting(false);
    }
  };

  const [uploadingHero, setUploadingHero] = useState(false);

  // Upload App Logo to Supabase Storage CDN
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadProductImage(file);
      setShopInfo((prev) => ({ ...prev, logo: url }));
      showFeedback({ type: "success", text: "App icon uploaded to Supabase CDN!" });
    } catch {
      showFeedback({ type: "error", text: "Failed to upload logo image." });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload Hero Background Image to Supabase Storage CDN
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const url = await uploadProductImage(file);
      setShopInfo((prev) => ({ ...prev, heroImage: url }));
      showFeedback({ type: "success", text: "Homepage Hero background image uploaded to CDN!" });
    } catch {
      showFeedback({ type: "error", text: "Failed to upload hero image." });
    } finally {
      setUploadingHero(false);
    }
  };

  // Save Shop Details & Logo
  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    showFeedback(null);

    try {
      const res = await updateShopSettings({
        data: {
          settings: {
            store_name: shopInfo.name,
            store_logo: shopInfo.logo,
            store_phone: shopInfo.phoneDisplay,
            store_whatsapp: shopInfo.whatsapp,
            store_email: shopInfo.email,
            store_address: shopInfo.address,
            store_hours: shopInfo.hoursWeek,
            hero_title: shopInfo.heroTitle,
            hero_subtitle: shopInfo.heroSubtitle,
            hero_image: shopInfo.heroImage,
            hero_location_tag: shopInfo.heroLocationTag,
          },
        },
      });

      if (res?.success) {
        showFeedback({ type: "success", text: "Shop profile, Homepage Hero, and Branding updated successfully!" });
        router.invalidate();
      } else {
        showFeedback({ type: "error", text: res?.error || "Failed to update shop profile." });
      }
    } catch {
      showFeedback({ type: "error", text: "An unexpected error occurred while saving." });
    } finally {
      setSubmitting(false);
    }
  };

  // Create Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name.trim()) return;

    setSubmitting(true);
    showFeedback(null);

    try {
      const res = await createCategory({
        data: {
          name: catFormData.name.trim(),
          slug: catFormData.slug.trim() || undefined,
          tagline: catFormData.tagline.trim() || "High grade spare parts",
          sort_order: Number(catFormData.sort_order),
        },
      });

      if (res?.success) {
        showFeedback({ type: "success", text: `Category '${catFormData.name}' added!` });
        setCatFormData({ name: "", slug: "", tagline: "", sort_order: categoriesList.length + 2 });
        router.invalidate();
      } else {
        showFeedback({ type: "error", text: res?.error || "Failed to create category." });
      }
    } catch {
      showFeedback({ type: "error", text: "Error creating category." });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (slug: string) => {
    if (!confirm(`Delete category '${slug}'? Associated products will be moved to 'accessories'.`)) return;

    setSubmitting(true);
    showFeedback(null);

    try {
      const res = await deleteCategory({ data: { slug } });
      if (res?.success) {
        showFeedback({ type: "success", text: `Category '${slug}' deleted.` });
        router.invalidate();
      } else {
        showFeedback({ type: "error", text: res?.error || "Failed to delete category." });
      }
    } catch {
      showFeedback({ type: "error", text: "Error deleting category." });
    } finally {
      setSubmitting(false);
    }
  };

  // Create Staff Account
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    showFeedback(null);

    try {
      const res = await createStaffUser({
        data: staffFormData,
      });

      if (res?.success) {
        showFeedback({ type: "success", text: `Staff account '@${staffFormData.username}' created!` });
        setStaffFormData({ name: "", username: "", email: "", password: "", role: "staff" });
        router.invalidate();
      } else {
        showFeedback({ type: "error", text: res?.error || "Failed to create staff user." });
      }
    } catch {
      showFeedback({ type: "error", text: "Error creating user account." });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Staff Account
  const handleDeleteStaff = async (id: number, username: string) => {
    if (!confirm(`Remove staff account '@${username}'?`)) return;

    setSubmitting(true);
    showFeedback(null);

    try {
      const res = await deleteStaffUser({ data: { id } });
      if (res?.success) {
        showFeedback({ type: "success", text: `Account '@${username}' removed.` });
        router.invalidate();
      } else {
        showFeedback({ type: "error", text: res?.error || "Failed to remove account." });
      }
    } catch {
      showFeedback({ type: "error", text: "Error removing account." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Shop Settings & Management</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage store branding, App Icon/Logo, dynamic product categories, and staff user access.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "profile" ? "bg-amber-500 text-zinc-950 shadow-md" : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          <Wrench className="size-4" />
          <span>Shop Branding & Logo</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "categories" ? "bg-amber-500 text-zinc-950 shadow-md" : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="size-4" />
          <span>Category Management ({categoriesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "staff" ? "bg-amber-500 text-zinc-950 shadow-md" : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="size-4" />
          <span>Staff & User Accounts ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("cloud")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "cloud" ? "bg-amber-500 text-zinc-950 shadow-md" : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          <Database className="size-4" />
          <span>Cloud & Deployment</span>
        </button>
      </div>

      {/* TAB 1: SHOP BRANDING & LOGO */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveShopInfo} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sparkles className="size-4 text-amber-500" />
            Store Name & App Icon Customization
          </h2>

          {/* App Logo / Icon Uploader */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Store App Icon / Logo (Displayed on Homepage & Navigation)
            </label>
            <div className="mt-3 flex items-center gap-5">
              <div className="size-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0 shadow-lg">
                {shopInfo.logo ? (
                  <img src={shopInfo.logo} alt="App Logo" className="size-full object-cover" />
                ) : (
                  <Wrench className="size-8 text-amber-500" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-300 hover:border-amber-500 cursor-pointer">
                  <Upload className="size-4 text-amber-500" />
                  <span>{uploadingLogo ? "Uploading to CDN..." : "Upload New App Icon / Logo to Supabase CDN"}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <input
                  type="text"
                  value={shopInfo.logo}
                  onChange={(e) => setShopInfo({ ...shopInfo, logo: e.target.value })}
                  placeholder="Or paste Logo Image URL"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400">Store Name</label>
              <input
                type="text"
                required
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
              placeholder="e.g. wakiseka kampala"
              className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Homepage Hero Customization & Background Image Uploader */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Globe className="size-4 text-amber-500" />
              Homepage Hero Section & Background Image Customization
            </h3>

            {/* Hero Background Image Uploader */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Hero Background Image (Uploaded to Supabase CDN)
              </label>
              <div className="mt-3 flex items-center gap-5">
                <div className="h-20 w-32 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center shrink-0 shadow-lg">
                  {shopInfo.heroImage ? (
                    <img src={shopInfo.heroImage} alt="Hero Background" className="size-full object-cover" />
                  ) : (
                    <Globe className="size-8 text-amber-500" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300 hover:border-amber-500 cursor-pointer">
                    <Upload className="size-4 text-amber-500" />
                    <span>{uploadingHero ? "Uploading Hero Image..." : "Upload New Hero Background Picture to Supabase CDN"}</span>
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    value={shopInfo.heroImage}
                    onChange={(e) => setShopInfo({ ...shopInfo, heroImage: e.target.value })}
                    placeholder="Or paste Hero Image URL"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Location Tagline (Top of Hero)</label>
                <input
                  type="text"
                  value={shopInfo.heroLocationTag}
                  onChange={(e) => setShopInfo({ ...shopInfo, heroLocationTag: e.target.value })}
                  placeholder="e.g. NAKAWA, KAMPALA or WAKISEKA, KAMPALA"
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Main Hero Heading Title</label>
                <input
                  type="text"
                  value={shopInfo.heroTitle}
                  onChange={(e) => setShopInfo({ ...shopInfo, heroTitle: e.target.value })}
                  placeholder="e.g. Japanese and European parts. On the shelf."
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-400">Hero Subtitle / Description</label>
              <textarea
                rows={2}
                value={shopInfo.heroSubtitle}
                onChange={(e) => setShopInfo({ ...shopInfo, heroSubtitle: e.target.value })}
                placeholder="e.g. Spare parts for Japanese and European vehicles. Headlamps, taillamps, grills and workshop fluids..."
                className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>Save Shop Branding & Homepage Hero</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: DYNAMIC CATEGORY MANAGEMENT */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Header Navigation Categories Picker */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="size-4 text-amber-500" />
                  Header Navigation Bar Categories (Select 3 Displayed on Website Header)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Choose the 3 spare part categories featured in the top header navigation menu across the application.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveHeaderCategories()}
                disabled={submitting || headerCategories.length === 0 || headerCategories.length > 3}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50 shrink-0"
              >
                <Save className="size-4" />
                <span>Save Top Header Links ({headerCategories.length}/3)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {categoriesList.map((c) => {
                const isSelected = headerCategories.some((s) => s.toLowerCase() === c.slug.toLowerCase());
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleHeaderCategory(c.slug)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-lg"
                        : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && <CheckCircle2 className="size-4 text-amber-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Plus className="size-4 text-amber-500" />
              Add New Spare Part Category
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Category Name</label>
                <input
                  type="text"
                  required
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  placeholder="e.g. Engine Components"
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Tagline / Subtitle</label>
                <input
                  type="text"
                  required
                  value={catFormData.tagline}
                  onChange={(e) => setCatFormData({ ...catFormData, tagline: e.target.value })}
                  placeholder="e.g. Pistons, belts, and gaskets"
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Sort Order</label>
                <input
                  type="number"
                  required
                  value={catFormData.sort_order}
                  onChange={(e) => setCatFormData({ ...catFormData, sort_order: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
              >
                <Plus className="size-4" />
                <span>Create Category</span>
              </button>
            </div>
          </form>

          {/* Existing Categories Table */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug Identifier</th>
                  <th className="px-6 py-4">Header Display</th>
                  <th className="px-6 py-4">Tagline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {categoriesList.map((c) => {
                  const isHeader = headerCategories.some((s) => s.toLowerCase() === c.slug.toLowerCase());
                  return (
                    <tr key={c.slug} className="hover:bg-zinc-800/40">
                      <td className="px-6 py-4 font-mono text-amber-400 font-bold">#{c.sort_order}</td>
                      <td className="px-6 py-4 font-semibold text-white">{c.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">{c.slug}</td>
                      <td className="px-6 py-4">
                        {isHeader ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                            <CheckCircle2 className="size-3" /> Header Link
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">{c.tagline}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c.slug)}
                          title="Delete Category"
                          className="flex size-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF & STAKEHOLDER ACCOUNTS */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          {session?.role !== "owner" ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-xs text-amber-300">
              Only the primary Shop Owner can manage staff user accounts.
            </div>
          ) : (
            <>
              {/* Add Staff User Form */}
              <form onSubmit={handleAddStaff} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <UserPlus className="size-4 text-amber-500" />
                  Add Staff / Stakeholder Sub-Account
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={staffFormData.name}
                      onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                      placeholder="e.g. Alex Staff"
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400">Username</label>
                    <input
                      type="text"
                      required
                      value={staffFormData.username}
                      onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                      placeholder="e.g. alexstaff"
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      required
                      value={staffFormData.email}
                      onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                      placeholder="staff@example.ug"
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={staffFormData.password}
                      onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-zinc-400">Access Role</label>
                    <select
                      value={staffFormData.role}
                      onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as "owner" | "staff" })}
                      className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="staff">Staff / Stakeholder (Catalog & Orders Only)</option>
                      <option value="owner">Full Owner (All Tabs & Settings)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                  >
                    <UserPlus className="size-4" />
                    <span>Create User Account</span>
                  </button>
                </div>
              </form>

              {/* Active Accounts Table */}
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="px-6 py-4">User Name</th>
                      <th className="px-6 py-4">Username & Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {staffList.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/40">
                        <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                        <td className="px-6 py-4 text-xs text-zinc-400">
                          <p className="text-zinc-200">@{u.username}</p>
                          <p className="text-zinc-500">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              u.role === "owner"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.id !== session?.id && (
                            <button
                              onClick={() => handleDeleteStaff(u.id, u.username)}
                              title="Delete User Account"
                              className="flex size-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: CLOUD & DEPLOYMENT */}
      {activeTab === "cloud" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Database className="size-4 text-emerald-400" />
            Supabase Database & CDN Storage Status
          </h2>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span>DATABASE_URL (Supabase PostgreSQL)</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
                Connected & Active
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-300">
              <span>VITE_SUPABASE_URL (Bucket: product-images)</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20 font-sans font-semibold">
                Public Storage CDN Active
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
