import { z } from "zod";

/*
 * Shared validation. The SAME schemas run in the admin UI (for immediate feedback)
 * and in the server functions (the real boundary). Browser checks are never trusted.
 */
export const SUPPORTED_CURRENCIES = ["TZS"] as const;
export const SITE_TIMEZONE = "Africa/Dar_es_Salaam" as const;
export const PHOTO_MODES = ["portrait-cutout", "editorial-photo"] as const;
export const TOURNAMENT_STATUSES = ["upcoming", "completed", "postponed", "cancelled"] as const;
export const AVAILABILITY = ["available", "unavailable", "coming_soon"] as const;

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Accepts a bare 11-character ID or a standard YouTube watch/short URL. Returns the ID. */
export function youtubeIdFromInput(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
  else if (host === "youtube.com" || host === "m.youtube.com") {
    id = url.searchParams.get("v");
    if (!id && url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] ?? null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Enter your password.").max(256),
});

export const tournamentSchema = z
  .object({
    tournamentNumber: z
      .number()
      .int("Tournament number must be a whole number.")
      .positive("Tournament number must be above zero."),
    title: z.string().trim().min(1, "Title is required.").max(160),
    startsAt: z
      .string()
      .datetime({ offset: true, message: "Choose a valid date and time." })
      .nullable(),
    timezone: z.literal(SITE_TIMEZONE),
    status: z.enum(TOURNAMENT_STATUSES),
    registrationMethod: z.enum(["app", "web"]),
    registrationUrl: z
      .string()
      .trim()
      .url("Enter a full https:// link.")
      .startsWith("https://")
      .nullable(),
    playMode: z.literal("on_app"),
    published: z.boolean(),
  })
  .superRefine((t, ctx) => {
    if (t.registrationMethod === "web" && !t.registrationUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationUrl"],
        message: "Web registration needs a registration link.",
      });
    }
    if (t.registrationMethod === "app" && t.registrationUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationUrl"],
        message: "App registration must not have a link.",
      });
    }
  });

export const winnerSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required.").max(80),
  placement: z.number().int().min(1, "Rank must be 1, 2 or 3.").max(3, "Rank must be 1, 2 or 3."),
  location: z.string().trim().min(1, "Location is required.").max(120),
  prizeAmount: z.number().int("Prize must be a whole number.").min(0, "Prize cannot be negative."),
  currency: z.enum(SUPPORTED_CURRENCIES),
  photoMode: z.enum(PHOTO_MODES),
  imagePath: z.string().max(300).nullable(),
  sortOrder: z.number().int().min(0),
  published: z.boolean(),
});

export const productSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(SLUG, "Use lowercase letters, numbers and hyphens."),
    category: z.string().trim().min(1, "Category is required.").max(60),
    name: z.string().trim().min(1, "Name is required.").max(120),
    description: z.string().trim().max(1000).nullable(),
    nameSw: z.string().trim().max(120).nullable(),
    descriptionSw: z.string().trim().max(1000).nullable(),
    imagePath: z.string().max(300).nullable(),
    priceAmount: z.number().int().min(0, "Price cannot be negative.").nullable(),
    currency: z.enum(SUPPORTED_CURRENCIES).nullable(),
    availability: z.enum(AVAILABILITY),
    featured: z.boolean(),
    sortOrder: z.number().int().min(0),
    published: z.boolean(),
  })
  .superRefine((p, ctx) => {
    if (p.priceAmount !== null && !p.currency) {
      ctx.addIssue({
        code: "custom",
        path: ["currency"],
        message: "Choose a currency for the price.",
      });
    }
  });

export const tutorialSchema = z.object({
  language: z.enum(["en", "sw"]),
  title: z.string().trim().min(1, "Title is required.").max(160),
  youtubeUrl: z
    .string()
    .trim()
    .min(1, "Paste a YouTube link.")
    .max(300)
    .transform((value, ctx) => {
      const id = youtubeIdFromInput(value);
      if (!id) {
        ctx.addIssue({
          code: "custom",
          message:
            "Use a YouTube link such as https://youtu.be/… or https://www.youtube.com/watch?v=…",
        });
        return z.NEVER;
      }
      return id;
    }),
  published: z.boolean(),
  active: z.boolean(),
});

export const settingsSchema = z.object({
  tournamentCountdownEnabled: z.boolean(),
});

export type TournamentInput = z.infer<typeof tournamentSchema>;
export type WinnerInput = z.infer<typeof winnerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type TutorialInput = z.output<typeof tutorialSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
