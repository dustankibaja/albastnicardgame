/*
 * Winners, products and media mutation cores. Framework-free: each takes the caller's own
 * request-bound Supabase client. RLS remains the final enforcement; these checks make
 * denials, duplicate ranks and empty writes visible instead of silently "succeeding".
 */
import type { WinnerInput, ProductInput } from "./schemas";

export type CoreResult<T> = { ok: true; data: T } | { ok: false; error: string };

type Row = Record<string, unknown>;
export type Q = {
  from(table: string): {
    insert(values: Row): {
      select(columns: string): PromiseLike<{ data: Row[] | null; error: { code?: string } | null }>;
    };
    update(values: Row): {
      eq(
        column: string,
        value: unknown,
      ): {
        select(
          columns: string,
        ): PromiseLike<{ data: Row[] | null; error: { code?: string } | null }>;
      };
    };
    delete(): {
      eq(
        column: string,
        value: unknown,
      ): {
        select(
          columns: string,
        ): PromiseLike<{ data: Row[] | null; error: { code?: string } | null }>;
      };
    };
    select(columns: string): {
      eq(
        column: string,
        value: unknown,
      ): {
        order(
          column: string,
          opts: { ascending: boolean },
        ): PromiseLike<{ data: Row[] | null; error: unknown }>;
      };
    };
  };
};

const UNIQUE_VIOLATION = "23505";

function winnerRow(v: WinnerInput, tournamentId: string): Row {
  return {
    tournament_id: tournamentId,
    display_name: v.displayName,
    placement: v.placement,
    location: v.location,
    prize_amount: v.prizeAmount,
    currency: v.currency,
    photo_mode: v.photoMode,
    image_path: v.imagePath,
    sort_order: v.sortOrder,
    published: v.published,
  };
}

export async function createWinner(
  q: Q,
  tournamentId: string,
  v: WinnerInput,
): Promise<CoreResult<Row>> {
  const { data, error } = await q.from("winners").insert(winnerRow(v, tournamentId)).select("*");
  if (error?.code === UNIQUE_VIOLATION)
    return { ok: false, error: "Another winner already has that rank in this tournament." };
  if (error) return { ok: false, error: "The winner could not be saved. Try again." };
  if (!data || data.length !== 1)
    return {
      ok: false,
      error: "The winner was not saved. Your permissions may not allow this change.",
    };
  return { ok: true, data: data[0]! };
}

export async function updateWinner(
  q: Q,
  id: string,
  tournamentId: string,
  v: WinnerInput,
): Promise<CoreResult<Row>> {
  const { data, error } = await q
    .from("winners")
    .update(winnerRow(v, tournamentId))
    .eq("id", id)
    .select("*");
  if (error?.code === UNIQUE_VIOLATION)
    return { ok: false, error: "Another winner already has that rank in this tournament." };
  if (error) return { ok: false, error: "The winner could not be saved. Try again." };
  if (!data || data.length !== 1)
    return {
      ok: false,
      error:
        "The winner was not saved. It may no longer exist or your permissions may not allow this change.",
    };
  return { ok: true, data: data[0]! };
}

export async function setWinnerPublished(
  q: Q,
  id: string,
  published: boolean,
): Promise<CoreResult<boolean>> {
  const { data, error } = await q.from("winners").update({ published }).eq("id", id).select("id");
  if (error) return { ok: false, error: "The change could not be saved. Try again." };
  if (!data || data.length !== 1) return { ok: false, error: "The change was not saved." };
  return { ok: true, data: published };
}

export async function deleteWinner(q: Q, id: string): Promise<CoreResult<true>> {
  const { data, error } = await q.from("winners").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: "The winner could not be deleted. Try again." };
  if (!data || data.length !== 1)
    return {
      ok: false,
      error: "The winner was not deleted. Your permissions may not allow this change.",
    };
  return { ok: true, data: true };
}

/**
 * Move a winner up or down within its tournament by swapping sort_order with its neighbour.
 * Both writes must be confirmed; a half-applied swap is restored and reported as a failure.
 */
export async function moveWinner(
  q: Q,
  tournamentId: string,
  id: string,
  direction: "up" | "down",
): Promise<CoreResult<true>> {
  const listed = await q
    .from("winners")
    .select("id, sort_order")
    .eq("tournament_id", tournamentId)
    .order("sort_order", { ascending: true });
  if (listed.error || !listed.data)
    return { ok: false, error: "Could not read the current order." };
  const rows = listed.data as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index < 0) return { ok: false, error: "This winner could not be found." };
  const neighbour = rows[direction === "up" ? index - 1 : index + 1];
  if (!neighbour) return { ok: true, data: true }; // already at the edge: nothing to change
  const me = rows[index]!;
  const first = await q
    .from("winners")
    .update({ sort_order: neighbour.sort_order })
    .eq("id", me.id)
    .select("id");
  if (first.error || !first.data || first.data.length !== 1)
    return { ok: false, error: "The order could not be changed." };
  const second = await q
    .from("winners")
    .update({ sort_order: me.sort_order })
    .eq("id", neighbour.id)
    .select("id");
  if (second.error || !second.data || second.data.length !== 1) {
    // Restore the first row so the order is never left half-changed.
    await q.from("winners").update({ sort_order: me.sort_order }).eq("id", me.id).select("id");
    return { ok: false, error: "The order could not be changed. It has been left as it was." };
  }
  return { ok: true, data: true };
}

function productRow(v: ProductInput): Row {
  return {
    slug: v.slug,
    category: v.category,
    name: v.name,
    description: v.description,
    name_sw: v.nameSw,
    description_sw: v.descriptionSw,
    image_path: v.imagePath,
    price_amount: v.priceAmount,
    currency: v.currency,
    availability: v.availability,
    featured: v.featured,
    sort_order: v.sortOrder,
    published: v.published,
  };
}

export async function createProduct(q: Q, v: ProductInput): Promise<CoreResult<Row>> {
  const { data, error } = await q.from("products").insert(productRow(v)).select("*");
  if (error?.code === UNIQUE_VIOLATION)
    return { ok: false, error: "A product with this slug already exists." };
  if (error) return { ok: false, error: "The product could not be saved. Try again." };
  if (!data || data.length !== 1)
    return {
      ok: false,
      error: "The product was not saved. Your permissions may not allow this change.",
    };
  return { ok: true, data: data[0]! };
}

export async function updateProduct(q: Q, id: string, v: ProductInput): Promise<CoreResult<Row>> {
  const { data, error } = await q.from("products").update(productRow(v)).eq("id", id).select("*");
  if (error?.code === UNIQUE_VIOLATION)
    return { ok: false, error: "A product with this slug already exists." };
  if (error) return { ok: false, error: "The product could not be saved. Try again." };
  if (!data || data.length !== 1)
    return {
      ok: false,
      error:
        "The product was not saved. It may no longer exist or your permissions may not allow this change.",
    };
  return { ok: true, data: data[0]! };
}

export async function deleteProduct(q: Q, id: string): Promise<CoreResult<true>> {
  const { data, error } = await q.from("products").delete().eq("id", id).select("id");
  if (error) return { ok: false, error: "The product could not be deleted. Try again." };
  if (!data || data.length !== 1)
    return {
      ok: false,
      error: "The product was not deleted. Your permissions may not allow this change.",
    };
  return { ok: true, data: true };
}

// ---- media: validated before any upload; the path is saved only after the upload is confirmed ----
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSION: Record<(typeof ALLOWED_IMAGE_TYPES)[number], string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function validateImage(file: {
  type: string;
  size: number;
}): { ok: true } | { ok: false; error: string } {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type))
    return { ok: false, error: "Upload a PNG, JPEG or WebP image." };
  if (file.size <= 0) return { ok: false, error: "The file is empty." };
  if (file.size > MAX_IMAGE_BYTES)
    return { ok: false, error: "The image must be 5 MB or smaller." };
  return { ok: true };
}

/** Storage path under the allowed folder. The name is generated, never taken from the user. */
export function mediaPath(
  folder: "winners" | "products",
  id: string,
  mime: (typeof ALLOWED_IMAGE_TYPES)[number],
): string {
  return `${folder}/${id}-${Date.now()}.${EXTENSION[mime]}`;
}

export type StorageLike = {
  from(bucket: string): {
    upload(
      path: string,
      file: Blob,
      opts: { contentType: string; upsert: boolean },
    ): PromiseLike<{ data: { path: string } | null; error: unknown }>;
  };
};

/** Upload with the admin's own session. Returns the stored path only after the upload is confirmed. */
export async function uploadImage(
  storage: StorageLike,
  folder: "winners" | "products",
  id: string,
  file: { type: string; size: number },
  blob: Blob,
): Promise<CoreResult<string>> {
  const check = validateImage(file);
  if (!check.ok) return check;
  const mime = file.type as (typeof ALLOWED_IMAGE_TYPES)[number];
  const path = mediaPath(folder, id, mime);
  const { data, error } = await storage
    .from("site-media")
    .upload(path, blob, { contentType: mime, upsert: false });
  if (error || !data?.path)
    return { ok: false, error: "The image could not be uploaded. Nothing was saved. Try again." };
  return { ok: true, data: data.path };
}
