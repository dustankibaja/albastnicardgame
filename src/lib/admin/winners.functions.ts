import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireAdmin, failure, asCoreQuery, type MutationResult } from "./guard";
import {
  createWinner,
  updateWinner,
  setWinnerPublished,
  deleteWinner,
  moveWinner,
  uploadImage,
  validateImage,
  type CoreResult,
  type StorageLike,
} from "./catalog-core";
import { winnerSchema } from "./schemas";

export type WinnerRow = {
  id: string;
  tournamentId: string;
  displayName: string;
  placement: number;
  location: string;
  prizeAmount: number;
  currency: string;
  photoMode: "portrait-cutout" | "editorial-photo";
  imagePath: string | null;
  sortOrder: number;
  published: boolean;
};
type Db = {
  id: string;
  tournament_id: string;
  display_name: string;
  placement: number;
  location: string;
  prize_amount: number;
  currency: string;
  photo_mode: WinnerRow["photoMode"];
  image_path: string | null;
  sort_order: number;
  published: boolean;
};
const toRow = (r: Db): WinnerRow => ({
  id: r.id,
  tournamentId: r.tournament_id,
  displayName: r.display_name,
  placement: r.placement,
  location: r.location,
  prizeAmount: r.prize_amount,
  currency: r.currency,
  photoMode: r.photo_mode,
  imagePath: r.image_path,
  sortOrder: r.sort_order,
  published: r.published,
});
const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

export const listWinners = createServerFn({ method: "GET" }).handler(
  async (): Promise<MutationResult<WinnerRow[]>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const { data, error } = await supabase
        .from("winners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return { ok: false, error: "Could not load winners." };
      return { ok: true, data: (data as Db[]).map(toRow) };
    } catch (e) {
      return failure(e, "Could not load winners.");
    }
  },
);

/** Create (id null) or update (id set). Validated on the server; success only after the DB confirms. */
export const saveWinner = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; tournamentId?: unknown; values?: unknown };
    if (raw?.id !== null && !isUuid(raw?.id)) throw new Error("Invalid winner id.");
    if (!isUuid(raw?.tournamentId)) throw new Error("Invalid tournament.");
    return {
      id: raw.id as string | null,
      tournamentId: raw.tournamentId,
      values: winnerSchema.parse(raw.values),
    };
  })
  .handler(async ({ data }): Promise<CoreResult<WinnerRow>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const q = asCoreQuery(supabase);
      const result = data.id
        ? await updateWinner(q, data.id, data.tournamentId, data.values)
        : await createWinner(q, data.tournamentId, data.values);
      return result.ok ? { ok: true, data: toRow(result.data as Db) } : result;
    } catch (e) {
      return failure(e);
    }
  });

export const setWinnerPublishedFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; published?: unknown };
    if (!isUuid(raw?.id) || typeof raw?.published !== "boolean")
      throw new Error("Invalid request.");
    return { id: raw.id, published: raw.published };
  })
  .handler(async ({ data }): Promise<MutationResult<boolean>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      return await setWinnerPublished(asCoreQuery(supabase), data.id, data.published);
    } catch (e) {
      return failure(e);
    }
  });

export const deleteWinnerFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown };
    if (!isUuid(raw?.id)) throw new Error("Invalid winner id.");
    return { id: raw.id };
  })
  .handler(async ({ data }): Promise<MutationResult<true>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      return await deleteWinner(asCoreQuery(supabase), data.id);
    } catch (e) {
      return failure(e);
    }
  });

export const moveWinnerFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; tournamentId?: unknown; direction?: unknown };
    if (!isUuid(raw?.id) || !isUuid(raw?.tournamentId)) throw new Error("Invalid request.");
    if (raw.direction !== "up" && raw.direction !== "down") throw new Error("Invalid direction.");
    return {
      id: raw.id,
      tournamentId: raw.tournamentId,
      direction: raw.direction as "up" | "down",
    };
  })
  .handler(async ({ data }): Promise<MutationResult<true>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      return await moveWinner(asCoreQuery(supabase), data.tournamentId, data.id, data.direction);
    } catch (e) {
      return failure(e);
    }
  });

/**
 * Winner photo upload. The image bytes come from the admin's browser as base64; the server
 * validates type and size BEFORE decoding, uploads with the admin's own session, and returns
 * the stored path only after the upload is confirmed.
 */
export const uploadWinnerImage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; mime?: unknown; size?: unknown; base64?: unknown };
    if (!isUuid(raw?.id)) throw new Error("Invalid winner id.");
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
        "winners",
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
