import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listProducts,
  saveProduct,
  deleteProductFn,
  uploadProductImage,
  type ProductRow,
} from "@/lib/admin/products.functions";
import { productSchema, AVAILABILITY, SUPPORTED_CURRENCIES } from "@/lib/admin/schemas";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/admin/catalog-core";
import { AlbaButton } from "@/components/site/AlbaButton";
import { SaveStatus, type SaveState } from "./SaveStatus";
import { AlertConfirm, AdminField } from "./AlertConfirm";

type Draft = {
  slug: string;
  category: string;
  name: string;
  description: string;
  nameSw: string;
  descriptionSw: string;
  price: string;
  currency: string;
  availability: string;
  featured: boolean;
  sortOrder: number;
  published: boolean;
  imagePath: string | null;
};

const blank = (next: number): Draft => ({
  slug: "",
  category: "cards",
  name: "",
  description: "",
  nameSw: "",
  descriptionSw: "",
  price: "",
  currency: "",
  availability: "coming_soon",
  featured: false,
  sortOrder: next,
  published: false,
  imagePath: null,
});

const fromRow = (p: ProductRow): Draft => ({
  slug: p.slug,
  category: p.category,
  name: p.name,
  description: p.description ?? "",
  nameSw: p.nameSw ?? "",
  descriptionSw: p.descriptionSw ?? "",
  price: p.priceAmount === null ? "" : String(p.priceAmount),
  currency: p.currency ?? "",
  availability: p.availability,
  featured: p.featured,
  sortOrder: p.sortOrder,
  published: p.published,
  imagePath: p.imagePath,
});

export function ShopEditor() {
  const list = useServerFn(listProducts);
  const save = useServerFn(saveProduct);
  const remove = useServerFn(deleteProductFn);
  const upload = useServerFn(uploadProductImage);

  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const load = useCallback(async () => {
    setLoadError(null);
    const r = await list();
    if (!r.ok) {
      setLoadError(r.error);
      return;
    }
    setRows(r.data);
  }, [list]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError)
    return (
      <p role="alert" className="border-l-4 border-alba-ink bg-alba-gold/30 p-4 text-sm">
        {loadError}
      </p>
    );
  if (rows === null)
    return (
      <p role="status" className="text-sm">
        Loading products…
      </p>
    );

  const current = rows.find((r) => r.id === selectedId) ?? null;
  const isNew = selectedId === "__new__";

  function select(p: ProductRow) {
    setSelectedId(p.id);
    setDraft(fromRow(p));
    setErrors({});
    setState({ kind: "idle" });
  }

  function startNew() {
    setSelectedId("__new__");
    setDraft(blank((rows?.length ?? 0) + 1));
    setErrors({});
    setState({ kind: "idle" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const hasPrice = draft.price.trim() !== "";
    const parsed = productSchema.safeParse({
      slug: draft.slug,
      category: draft.category,
      name: draft.name,
      description: draft.description.trim() || null,
      nameSw: draft.nameSw.trim() || null,
      descriptionSw: draft.descriptionSw.trim() || null,
      imagePath: draft.imagePath,
      priceAmount: hasPrice ? Number(draft.price) : null,
      currency: hasPrice ? draft.currency || null : null,
      availability: draft.availability,
      featured: draft.featured,
      sortOrder: draft.sortOrder,
      published: draft.published,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0] ?? "form")] = issue.message;
      setErrors(next);
      setState({ kind: "error", message: "Check the highlighted fields." });
      return;
    }
    setErrors({});
    setState({ kind: "saving" });
    const r = await save({ data: { id: isNew ? null : selectedId, values: parsed.data } });
    if (!r.ok) {
      setState({ kind: "error", message: r.error });
      return;
    }
    setState({ kind: "saved" });
    setSelectedId(r.data.id);
    await load();
  }

  async function onFile(file: File | undefined) {
    if (!file || !current) return;
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setState({ kind: "error", message: "Upload a PNG, JPEG or WebP image." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setState({ kind: "error", message: "The image must be 5 MB or smaller." });
      return;
    }
    setState({ kind: "saving" });
    try {
      const r = await upload({ data: { id: current.id, mime: file.type, size: file.size } });
      if (!r.ok) {
        setState({ kind: "error", message: r.error });
        return;
      }
      const client = createSupabaseBrowserClient();
      if (!client) throw new Error("Image upload is not configured.");
      const sent = await client.storage
        .from("site-media")
        .uploadToSignedUrl(r.data.path, r.data.token, file, { contentType: file.type });
      if (sent.error) throw new Error("Upload failed. Check your connection and try again.");
      setDraft((d) => (d ? { ...d, imagePath: r.data.path } : d));
      setState({ kind: "idle" });
    } catch {
      setState({
        kind: "error",
        message: "The image could not be uploaded. Try a PNG, JPEG or WebP up to 5 MB.",
      });
    }
  }

  async function onDelete(id: string) {
    const r = await remove({ data: { id } });
    if (!r.ok) {
      setState({ kind: "error", message: r.error });
      return;
    }
    setSelectedId(null);
    setDraft(null);
    setState({ kind: "idle" });
    await load();
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <section aria-labelledby="products-h">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="products-h" className="label">
            Products
          </h2>
          <AlbaButton size="sm" type="button" onClick={startNew}>
            Add product
          </AlbaButton>
        </div>
        {rows.length === 0 ? <p className="mt-4 text-sm">No products yet.</p> : null}
        <ul className="mt-4 grid gap-3">
          {rows.map((p) => (
            <li
              key={p.id}
              className="grid gap-2 border-2 border-alba-ink p-3"
              aria-current={p.id === selectedId ? "true" : undefined}
            >
              <button
                type="button"
                onClick={() => select(p)}
                className="min-h-11 text-left font-bold"
              >
                {p.name}
                <span className="block text-sm font-normal">
                  {p.availability.replace("_", " ")} ·{" "}
                  {p.priceAmount === null
                    ? "No price set"
                    : `${p.priceAmount.toLocaleString("en-US")} ${p.currency}`}
                  {p.published ? "" : " · Hidden"}
                  {p.featured ? " · Featured" : ""}
                </span>
              </button>
              <AlertConfirm
                trigger={
                  <button
                    type="button"
                    className="min-h-11 w-fit border-2 border-alba-ink px-3 font-bold"
                  >
                    Delete
                  </button>
                }
                title={`Delete ${p.name}?`}
                body="This removes the product from the database. It cannot be undone."
                confirmLabel="Delete product"
                onConfirm={() => void onDelete(p.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      {draft ? (
        <form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-5"
          aria-label={isNew ? "New product" : `Edit ${current?.name ?? "product"}`}
        >
          <AdminField id="p-name" label="Name (English)" error={errors["name"]}>
            <input
              id="p-name"
              className="alba-field"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors["name"]}
            />
          </AdminField>
          <AdminField id="p-slug" label="Slug (lowercase, hyphens)" error={errors["slug"]}>
            <input
              id="p-slug"
              className="alba-field"
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
              aria-invalid={!!errors["slug"]}
            />
          </AdminField>
          <AdminField id="p-cat" label="Category" error={errors["category"]}>
            <input
              id="p-cat"
              className="alba-field"
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              aria-invalid={!!errors["category"]}
            />
          </AdminField>
          <AdminField id="p-desc" label="Description (English)" error={errors["description"]}>
            <textarea
              id="p-desc"
              rows={3}
              className="alba-field h-auto py-2"
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </AdminField>
          <AdminField id="p-name-sw" label="Name (Kiswahili, optional)" error={errors["nameSw"]}>
            <input
              id="p-name-sw"
              className="alba-field"
              value={draft.nameSw}
              onChange={(e) => set("nameSw", e.target.value)}
            />
          </AdminField>
          <AdminField
            id="p-desc-sw"
            label="Description (Kiswahili, optional)"
            error={errors["descriptionSw"]}
          >
            <textarea
              id="p-desc-sw"
              rows={3}
              className="alba-field h-auto py-2"
              value={draft.descriptionSw}
              onChange={(e) => set("descriptionSw", e.target.value)}
            />
          </AdminField>
          <div className="grid gap-5 sm:grid-cols-3">
            <AdminField id="p-price" label="Price (optional)" error={errors["priceAmount"]}>
              <input
                id="p-price"
                inputMode="numeric"
                className="alba-field"
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="Not set"
                aria-invalid={!!errors["priceAmount"]}
              />
            </AdminField>
            <AdminField id="p-cur" label="Currency" error={errors["currency"]}>
              <select
                id="p-cur"
                className="alba-field"
                value={draft.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                <option value="">None</option>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField id="p-avail" label="Availability" error={undefined}>
              <select
                id="p-avail"
                className="alba-field"
                value={draft.availability}
                onChange={(e) => set("availability", e.target.value)}
              >
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {a.replace("_", " ")}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField id="p-sort" label="Sort order" error={errors["sortOrder"]}>
              <input
                id="p-sort"
                type="number"
                min={0}
                className="alba-field"
                value={draft.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </AdminField>
            <div className="grid content-end gap-3">
              <label className="flex min-h-11 items-center gap-3 font-bold">
                <input
                  type="checkbox"
                  className="size-5"
                  checked={draft.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                />
                Featured on the homepage
              </label>
              <label className="flex min-h-11 items-center gap-3 font-bold">
                <input
                  type="checkbox"
                  className="size-5"
                  checked={draft.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                Published
              </label>
            </div>
          </div>
          <div className="grid gap-2">
            <p className="label">Image</p>
            <p className="text-sm">
              {draft.imagePath
                ? "Image uploaded. Save this record to apply it to the website."
                : "No image stored. The site uses its verified image."}
            </p>
            {draft.imagePath ? (
              <img
                src={
                  createSupabaseBrowserClient()
                    ?.storage.from("site-media")
                    .getPublicUrl(draft.imagePath).data.publicUrl
                }
                alt="Selected image preview"
                className="h-40 max-w-full object-contain"
              />
            ) : null}
            {!isNew && current ? (
              <input
                disabled={state.kind === "saving"}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                aria-label="Upload product image"
                className="min-h-11"
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
            ) : (
              <p className="text-sm">
                Save the product first to enable image upload, then save again to apply the photo.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <AlbaButton type="submit" size="lg" disabled={state.kind === "saving"}>
              Save product
            </AlbaButton>
            <SaveStatus state={state} />
          </div>
        </form>
      ) : (
        <p className="text-sm">Select a product to edit, or add a new one.</p>
      )}
    </div>
  );
}
