import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireAdmin, failure, asCoreQuery, type MutationResult } from "./guard";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  validateImage,
  type CoreResult,
  type StorageLike,
} from "./catalog-core";
import { productSchema } from "./schemas";

export type ProductRow = {
  id: string;
  slug: string;
  category: string;
  name: string;
  description: string | null;
  nameSw: string | null;
  descriptionSw: string | null;
  imagePath: string | null;
  priceAmount: number | null;
  currency: string | null;
  availability: "available" | "unavailable" | "coming_soon";
  featured: boolean;
  sortOrder: number;
  published: boolean;
};
type Db = {
  id: string;
  slug: string;
  category: string;
  name: string;
  description: string | null;
  name_sw: string | null;
  description_sw: string | null;
  image_path: string | null;
  price_amount: number | null;
  currency: string | null;
  availability: ProductRow["availability"];
  featured: boolean;
  sort_order: number;
  published: boolean;
};
const toRow = (r: Db): ProductRow => ({
  id: r.id,
  slug: r.slug,
  category: r.category,
  name: r.name,
  description: r.description,
  nameSw: r.name_sw,
  descriptionSw: r.description_sw,
  imagePath: r.image_path,
  priceAmount: r.price_amount,
  currency: r.currency,
  availability: r.availability,
  featured: r.featured,
  sortOrder: r.sort_order,
  published: r.published,
});
const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<MutationResult<ProductRow[]>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return { ok: false, error: "Could not load products." };
      return { ok: true, data: (data as Db[]).map(toRow) };
    } catch (e) {
      return failure(e, "Could not load products.");
    }
  },
);

export const saveProduct = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; values?: unknown };
    if (raw?.id !== null && !isUuid(raw?.id)) throw new Error("Invalid product id.");
    return { id: raw.id as string | null, values: productSchema.parse(raw.values) };
  })
  .handler(async ({ data }): Promise<CoreResult<ProductRow>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const q = asCoreQuery(supabase);
      const result = data.id
        ? await updateProduct(q, data.id, data.values)
        : await createProduct(q, data.values);
      return result.ok ? { ok: true, data: toRow(result.data as Db) } : result;
    } catch (e) {
      return failure(e);
    }
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown };
    if (!isUuid(raw?.id)) throw new Error("Invalid product id.");
    return { id: raw.id };
  })
  .handler(async ({ data }): Promise<MutationResult<true>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      return await deleteProduct(asCoreQuery(supabase), data.id);
    } catch (e) {
      return failure(e);
    }
  });

/** Product photo upload under site-media/products/. Same validation and confirmation rules as winners. */
export const uploadProductImage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; mime?: unknown; size?: unknown; base64?: unknown };
    if (!isUuid(raw?.id)) throw new Error("Invalid product id.");
    if (
      typeof raw?.mime !== "string" ||
      typeof raw?.size !== "number" ||
      typeof raw?.base64 !== "string"
    ) {
      throw new Error("Invalid upload.");
    }
    return { id: raw.id, mime: raw.mime, size: raw.size, base64: raw.base64 };
  })
  .handler(async ({ data }): Promise<CoreResult<string>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    const check = validateImage({ type: data.mime, size: data.size });
    if (!check.ok) return check;
    try {
      const supabase = await requireAdmin();
      const bytes = Buffer.from(data.base64, "base64");
      if (bytes.length !== data.size)
        return { ok: false, error: "The file did not arrive intact. Try again." };
      return await uploadImage(
        supabase.storage as unknown as StorageLike,
        "products",
        data.id,
        { type: data.mime, size: data.size },
        new Blob([bytes], { type: data.mime }),
      );
    } catch (e) {
      return {
        ok: false,
        error: failure(e, "The image could not be uploaded. Nothing was saved.").error,
      };
    }
  });
