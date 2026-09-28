import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { listProducts, listCategories, Product, Category } from "@/lib/catalog";
import { createProduct, updateProduct, deleteProduct, toggleHotProduct } from "@/lib/admin-catalog";
import { uploadProductImage } from "@/lib/storage-store";
import { formatUgx } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  loader: async () => {
    const [products, categories] = await Promise.all([listProducts(), listCategories()]);
    return { products, categories };
  },
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const router = useRouter();
  const { products, categories } = Route.useLoaderData();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProductItem, setEditProductItem] = useState<Product | null>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    slug: "",
    brand: "",
    make: "",
    fitment: "",
    category_slug: categories[0]?.slug || "headlamps",
    price_ugx: 100000,
    grade: "OEM",
    stock: 5,
    hot: false,
    description: "",
    image: "/parts/headlamp.jpg",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.make && p.make.toLowerCase().includes(search.toLowerCase())) ||
      (p.fitment && p.fitment.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === "all" || p.category_slug === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const showFeedback = (fb: { type: "success" | "error"; text: string } | null) => {
    setFeedback(fb);
    if (fb && fb.type === "success") {
      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      id: 0,
      name: "",
      slug: "",
      brand: "Tool Hub",
      make: "Universal",
      fitment: "Standard",
      category_slug: categories[0]?.slug || "spanners",
      price_ugx: 75000,
      grade: "Heavy Duty",
      stock: 10,
      hot: false,
      description: "High quality industrial hardware tool. Durable construction and guaranteed performance.",
      image: "/parts/headlamp.jpg",
    });
    setIsAddOpen(true);
    showFeedback(null);
  };

  const handleOpenEdit = (p: Product) => {
    setFormData({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      make: p.make || "",
      fitment: p.fitment || "",
      category_slug: p.category_slug,
      price_ugx: p.price_ugx,
      grade: p.grade,
      stock: p.stock,
      hot: p.hot,
      description: p.description,
      image: p.image,
    });
    setEditProductItem(p);
    showFeedback(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    showFeedback(null);

    try {
      if (!formData.name || formData.name.trim().length < 2) {
        showFeedback({ type: "error", text: "Product name must be at least 2 characters." });
        return;
      }

      const generatedSlug = autoSlug(formData.slug) || autoSlug(formData.name);
      const slug = generatedSlug.length >= 2 ? generatedSlug : `part-${Date.now().toString().slice(-6)}`;

      if (editProductItem) {
        // Update existing
        const res = await updateProduct({
          data: {
            id: editProductItem.id,
            name: formData.name,
            slug,
            brand: formData.brand,
            make: formData.make || null,
            fitment: formData.fitment || null,
            category_slug: formData.category_slug,
            price_ugx: Number(formData.price_ugx),
            grade: formData.grade,
            stock: Number(formData.stock),
            hot: Boolean(formData.hot),
            description: formData.description,
            image: formData.image,
          },
        });

        if (res?.success) {
          showFeedback({ type: "success", text: `Product '${formData.name}' updated successfully.` });
          setEditProductItem(null);
          router.invalidate();
        } else {
          showFeedback({ type: "error", text: res?.error || "Failed to update product." });
        }
      } else {
        // Create new
        const res = await createProduct({
          data: {
            name: formData.name,
            slug,
            brand: formData.brand,
            make: formData.make || null,
            fitment: formData.fitment || null,
            category_slug: formData.category_slug,
            price_ugx: Number(formData.price_ugx),
            grade: formData.grade,
            stock: Number(formData.stock),
            hot: Boolean(formData.hot),
            description: formData.description,
            image: formData.image,
          },
        });

        if (res?.success) {
          showFeedback({ type: "success", text: `Product '${formData.name}' added to catalog!` });
          setIsAddOpen(false);
          router.invalidate();
        } else {
          showFeedback({ type: "error", text: res?.error || "Failed to create product." });
        }
      }
    } catch (err: unknown) {
      console.error("Error saving product:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while saving.";
      showFeedback({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductItem) return;
    setSubmitting(true);

    const res = await deleteProduct({
      data: { id: deleteProductItem.id, name: deleteProductItem.name },
    });

    if (res.success) {
      showFeedback({ type: "success", text: `Deleted '${deleteProductItem.name}'` });
      setDeleteProductItem(null);
      router.invalidate();
    } else {
      showFeedback({ type: "error", text: res.error || "Failed to delete item" });
    }
    setSubmitting(false);
  };

  const handleToggleHot = async (p: Product) => {
    await toggleHotProduct({ data: { id: p.id, hot: !p.hot } });
    router.invalidate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Product Catalog Management</h1>
          <p className="mt-1 text-sm text-zinc-400">Add, edit, upload photos, and manage stock for all spare parts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-amber-400"
        >
          <Plus className="size-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="rounded-lg p-1 opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 size-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by part name, brand, vehicle make or fitment..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pr-4 pl-9 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <Layers className="size-4 text-zinc-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-6 py-4">Product / Part</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price (UGX)</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Featured</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No products matched your filter. Try adjusting your search query.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="transition hover:bg-zinc-800/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shrink-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/parts/headlamp.jpg";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-zinc-400">
                          {p.brand} {p.make ? `• ${p.make}` : ""} {p.fitment ? `(${p.fitment})` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-400">
                    <span className="rounded-lg bg-zinc-800 px-2.5 py-1 text-zinc-200">
                      {p.category_slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {formatUgx(p.price_ugx)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${
                        p.stock <= 3
                          ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
                          : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleHot(p)}
                      title="Toggle Hot/Featured Status"
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        p.hot
                          ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                          : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Flame className="size-3.5" />
                      <span>{p.hot ? "Hot" : "Normal"}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="flex size-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-zinc-950"
                        title="Edit Product"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteProductItem(p)}
                        className="flex size-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                        title="Delete Product"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddOpen || editProductItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editProductItem ? `Edit Product (ID: #${editProductItem.id})` : "Add New Spare Part to Catalog"}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditProductItem(null);
                }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} autoComplete="off" className="space-y-4">
              {/* Product Name & Brand */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        slug: prev.slug || autoSlug(name),
                      }));
                    }}
                    placeholder="e.g. Premio 2012 Headlamp Assembly"
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. TYC, OEM, Toyota, Mobil"
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Grade */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">Category</label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">Grade / Quality</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="OEM">OEM</option>
                    <option value="Genuine">Genuine</option>
                    <option value="Aftermarket">Aftermarket</option>
                  </select>
                </div>
              </div>



              {/* Price & Stock */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">Price in UGX</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price_ugx}
                    onChange={(e) => setFormData({ ...formData, price_ugx: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400">Stock Available</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Product Image (Supabase CDN Ready)</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="size-20 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shrink-0">
                    <img src={formData.image} alt="Preview" className="size-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-300 hover:border-amber-500 cursor-pointer">
                      <Upload className="size-4 text-amber-500" />
                      <span>{uploadingImage ? "Processing upload..." : "Choose Image File (Upload to CDN / Preview)"}</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or paste image URL"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Hot Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hotCheckbox"
                  checked={formData.hot}
                  onChange={(e) => setFormData({ ...formData, hot: e.target.checked })}
                  className="size-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="hotCheckbox" className="text-xs font-semibold text-zinc-200">
                  Feature this product on homepage ("Hot / Popular")
                </label>
              </div>

              {feedback && (
                <div
                  className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-medium ${
                    feedback.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {feedback.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditProductItem(null);
                  }}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editProductItem ? "Update Product" : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to remove <strong className="text-white">{deleteProductItem.name}</strong> from the catalog? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteProductItem(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
