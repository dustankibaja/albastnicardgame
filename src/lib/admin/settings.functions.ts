import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireAdmin, failure, type MutationResult } from "./guard";
import { settingsSchema } from "./schemas";
import { setCountdownEnabled } from "./cms-core";

export const getCountdownEnabled = createServerFn({ method: "GET" }).handler(
  async (): Promise<MutationResult<boolean>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "tournament_countdown_enabled")
        .maybeSingle();
      if (error) return { ok: false, error: "Could not load the setting." };
      return { ok: true, data: (data as { value: unknown } | null)?.value === true };
    } catch (e) {
      return failure(e, "Could not load the setting.");
    }
  },
);

export const saveCountdownEnabled = createServerFn({ method: "POST" })
  .validator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data }): Promise<MutationResult<boolean>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      return await setCountdownEnabled(supabase, data.tournamentCountdownEnabled);
    } catch (e) {
      return failure(e);
    }
  });
