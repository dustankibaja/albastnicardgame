import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireAdmin, failure, type MutationResult } from "./guard";
import { tutorialSchema } from "./schemas";
import { saveTutorial } from "./cms-core";

export type TutorialRow = {
  id: string;
  language: "en" | "sw";
  title: string;
  youtubeId: string;
  published: boolean;
  active: boolean;
};

export const listTutorials = createServerFn({ method: "GET" }).handler(
  async (): Promise<MutationResult<TutorialRow[]>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      const { data, error } = await supabase
        .from("how_to_play_videos")
        .select("id, language, title, youtube_id, published, active")
        .order("language");
      if (error) return { ok: false, error: "Could not load tutorials." };
      return {
        ok: true,
        data: (
          data as {
            id: string;
            language: "en" | "sw";
            title: string;
            youtube_id: string;
            published: boolean;
            active: boolean;
          }[]
        ).map((r) => ({
          id: r.id,
          language: r.language,
          title: r.title,
          youtubeId: r.youtube_id,
          published: r.published,
          active: r.active,
        })),
      };
    } catch (e) {
      return failure(e, "Could not load tutorials.");
    }
  },
);

export const saveTutorialRecord = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = input as { id?: unknown; values?: unknown };
    if (typeof raw?.id !== "string" || !/^[0-9a-f-]{36}$/i.test(raw.id))
      throw new Error("Invalid tutorial id.");
    return { id: raw.id, values: tutorialSchema.parse(raw.values) };
  })
  .handler(async ({ data }): Promise<MutationResult<true>> => {
    setResponseHeader("Cache-Control", "private, no-store");
    try {
      const supabase = await requireAdmin();
      return await saveTutorial(supabase, data.id, data.values);
    } catch (e) {
      return failure(e);
    }
  });
