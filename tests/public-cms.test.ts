import { test } from "node:test";
import assert from "node:assert/strict";
import {
  composePublicContent,
  composeShop,
  fallbackContent,
  mapProduct,
  mapTournament,
  mapWinner,
  orderProducts,
  resolveDomain,
  teaserProduct,
  tutorialIdOrNull,
  localizedProductDescription,
  FALLBACK_PRODUCTS,
  FALLBACK_TUTORIAL_ID,
  type ProductRow,
  type QueryOutcome,
  type TournamentRow,
  type WinnerRow,
} from "../src/lib/public/cms-mapping";
import { formatPrice } from "../src/lib/public/format";
import { tournaments as staticTournaments } from "../src/content/tournaments";
import { winners as staticWinners, formatPrize, winnerPrize } from "../src/content/winners";

const NOW = Date.parse("2026-11-17T12:00:00Z");
const T27_ROW: TournamentRow = {
  id: "uuid-27",
  tournament_number: 27,
  title: "Tournament #27",
  starts_at: "2026-12-12T20:00:00+03:00",
  timezone: "Africa/Dar_es_Salaam",
  status: "upcoming",
  registration_method: "app",
  registration_url: null,
  published: true,
};
const T26_ROW: TournamentRow = {
  ...T27_ROW,
  id: "uuid-26",
  tournament_number: 26,
  starts_at: "2026-09-26T12:00:00+03:00",
  status: "completed",
};
const W_ROWS: WinnerRow[] = [
  {
    id: "w-mj",
    tournament_id: "uuid-26",
    display_name: "MJeshi",
    placement: 3,
    location: "Iringa, Tanzania",
    prize_amount: 26000,
    photo_mode: "portrait-cutout",
    published: true,
  },
  {
    id: "w-da",
    tournament_id: "uuid-26",
    display_name: "David Sanya",
    placement: 1,
    location: "Dar es Salaam, Tanzania",
    prize_amount: 130000,
    photo_mode: "portrait-cutout",
    published: true,
  },
  {
    id: "w-be",
    tournament_id: "uuid-26",
    display_name: "Bedadi",
    placement: 2,
    location: "Kilimanjaro, Tanzania",
    prize_amount: 65000,
    photo_mode: "editorial-photo",
    published: true,
  },
];
const ok = <T>(data: T): QueryOutcome<T> => ({ ok: true, data });
const fail = { ok: false as const };
const cmsAll = {
  upcoming: ok([T27_ROW]),
  champion: ok({ tournament: T26_ROW, winners: W_ROWS }),
  countdown: ok({ value: false }),
  tutorial: ok([{ youtube_id: "wGd1QJHSU0E" }]),
};

// ---- CASE A: CMS content available -> CMS content used ----
test("A: CMS rows available -> CMS content is used for every domain", () => {
  const c = composePublicContent(NOW, cmsAll);
  assert.equal(c.tournaments.source, "cms");
  assert.equal(c.winners.source, "cms");
  assert.equal(c.tutorialId.source, "cms");
  assert.equal(c.tournaments.data[0]?.number, 27);
  assert.equal(c.tournaments.data[0]?.date, "2026-12-12");
  assert.equal(c.tournaments.data[0]?.startAt, "2026-12-12T20:00:00+03:00");
});
test("A: winners come back in placement order with the stored prize", () => {
  const c = composePublicContent(NOW, cmsAll);
  assert.deepEqual(
    c.winners.data.map((w) => w.displayName),
    ["David Sanya", "Bedadi", "MJeshi"],
  );
  assert.equal(winnerPrize(c.winners.data[2]!), 26000);
  assert.equal(formatPrize(winnerPrize(c.winners.data[0]!)), "130,000 TSH");
});
test("A: MJeshi keeps its canonical spelling from the database", () => {
  assert.equal(composePublicContent(NOW, cmsAll).winners.data[2]?.displayName, "MJeshi");
});
test("A: seeded winners keep their repository photos; a new winner gets no fake photo", () => {
  const extra: WinnerRow = {
    ...W_ROWS[0]!,
    id: "w-new",
    display_name: "Unknown Champion",
    placement: 1,
  };
  const c = composePublicContent(NOW, {
    ...cmsAll,
    champion: ok({ tournament: T26_ROW, winners: [...W_ROWS, extra] }),
  });
  assert.ok(c.winners.data.find((w) => w.displayName === "Bedadi")?.portrait);
  assert.equal(
    c.winners.data.find((w) => w.displayName === "Unknown Champion")?.portrait,
    undefined,
  );
});
test("A: the champion winners link to their own tournament", () => {
  const c = composePublicContent(NOW, cmsAll);
  const champ = c.tournaments.data.find((t) => t.number === 26);
  assert.ok(champ);
  assert.ok(c.winners.data.every((w) => w.tournamentId === champ!.id));
});

// ---- CASE B: environment missing -> verified fallback ----
test("B: Supabase environment missing -> the verified static fallback everywhere", () => {
  const f = fallbackContent(NOW);
  assert.equal(f.tournaments.source, "fallback");
  assert.equal(f.winners.source, "fallback");
  assert.equal(f.countdown.data, false);
  assert.equal(f.tutorialId.data, FALLBACK_TUTORIAL_ID);
  assert.deepEqual(
    f.winners.data.map((w) => w.displayName),
    ["David Sanya", "Bedadi", "MJeshi"],
  );
});

// ---- CASE C: query errors -> verified fallback for that domain only ----
test("C: upcoming query fails -> tournament falls back; champions still from CMS", () => {
  const c = composePublicContent(NOW, { ...cmsAll, upcoming: fail });
  assert.equal(c.winners.source, "cms");
  assert.ok(c.tournaments.data.length > 0);
});
test("C: champion query fails -> winners fall back, consistent with the fallback tournament", () => {
  const c = composePublicContent(NOW, { ...cmsAll, champion: fail });
  assert.equal(c.winners.source, "fallback");
  const fallbackChampion = c.tournaments.data.find((t) => t.status === "completed");
  assert.ok(fallbackChampion);
  assert.ok(c.winners.data.every((w) => w.tournamentId === fallbackChampion!.id));
});
test("C: countdown query fails -> countdown OFF", () => {
  assert.deepEqual(composePublicContent(NOW, { ...cmsAll, countdown: fail }).countdown, {
    source: "fallback",
    data: false,
  });
});
test("C: tutorial query fails -> the English fallback tutorial", () => {
  assert.deepEqual(composePublicContent(NOW, { ...cmsAll, tutorial: fail }).tutorialId, {
    source: "fallback",
    data: FALLBACK_TUTORIAL_ID,
  });
});
test("C: each domain falls back independently of the others", () => {
  const c = composePublicContent(NOW, { ...cmsAll, tutorial: fail, countdown: fail });
  assert.equal(c.winners.source, "cms");
  assert.equal(c.tutorialId.source, "fallback");
  assert.equal(c.countdown.source, "fallback");
});

// ---- CASE D: unpublished / unusable records never render publicly ----
test("D: an unpublished tournament is not mapped for the public", () => {
  assert.equal(mapTournament({ ...T27_ROW, published: false }), null);
});
test("D: an unpublished winner is not mapped for the public", () => {
  assert.equal(mapWinner({ ...W_ROWS[0]!, published: false }, "uuid-26"), null);
});
test("D: a tournament with no start time is not shown as CMS data", () => {
  assert.equal(mapTournament({ ...T27_ROW, starts_at: null }), null);
});
test("D: an unknown status or foreign timezone is refused", () => {
  assert.equal(mapTournament({ ...T27_ROW, status: "hidden" }), null);
  assert.equal(mapTournament({ ...T27_ROW, timezone: "Europe/London" }), null);
});
test("D: a winner with a bad rank or photo mode is refused", () => {
  assert.equal(mapWinner({ ...W_ROWS[0]!, placement: 4 }, "uuid-26"), null);
  assert.equal(mapWinner({ ...W_ROWS[0]!, photo_mode: "cutout" as never }, "uuid-26"), null);
});
test("D: a published tutorial with a malformed ID is not used", () => {
  assert.equal(tutorialIdOrNull("<iframe>"), null);
  assert.equal(
    composePublicContent(NOW, { ...cmsAll, tutorial: ok([{ youtube_id: "<iframe>" }]) }).tutorialId
      .source,
    "fallback",
  );
});

// ---- EMPTY DATA -> verified fallback ----
test("EMPTY: no champions -> winners fall back", () => {
  assert.equal(
    composePublicContent(NOW, { ...cmsAll, champion: ok(null) }).winners.source,
    "fallback",
  );
});
test("EMPTY: champions with zero published winners -> winners fall back", () => {
  assert.equal(
    composePublicContent(NOW, { ...cmsAll, champion: ok({ tournament: T26_ROW, winners: [] }) })
      .winners.source,
    "fallback",
  );
});
test("EMPTY: resolveDomain treats an empty array as unusable", () => {
  assert.deepEqual(resolveDomain<number[]>({ ok: true, data: [] }, [1]), {
    source: "fallback",
    data: [1],
  });
});

// ---- countdown ----
test("countdown ON in the CMS is honoured; OFF is honoured; anything else is OFF", () => {
  assert.equal(
    composePublicContent(NOW, { ...cmsAll, countdown: ok({ value: true }) }).countdown.data,
    true,
  );
  assert.equal(
    composePublicContent(NOW, { ...cmsAll, countdown: ok({ value: false }) }).countdown.data,
    false,
  );
  assert.equal(
    composePublicContent(NOW, { ...cmsAll, countdown: ok({ value: "yes" }) }).countdown.data,
    false,
  );
});

// ---- fallback truth matches the source-controlled content ----
test("fallback tournaments and winners are exactly the source-controlled records", () => {
  const f = fallbackContent(NOW);
  assert.ok(f.tournaments.data.every((t) => staticTournaments.includes(t)));
  assert.ok(f.winners.data.every((w) => staticWinners.includes(w)));
});

// ---- SHOP ----
const baseProduct: ProductRow = {
  id: "p1",
  slug: "physical-cards",
  category: "cards",
  name: "Physical Cards",
  description: "Made for real tables.",
  name_sw: null,
  description_sw: null,
  price_amount: null,
  currency: null,
  availability: "coming_soon",
  featured: true,
  published: true,
  sort_order: 1,
};
const okP = (data: ProductRow[]): QueryOutcome<ProductRow[]> => ({ ok: true, data });

test("SHOP: a published product is used", () => {
  const d = composeShop(okP([baseProduct]));
  assert.equal(d.source, "cms");
  assert.equal(d.data[0]?.name, "Physical Cards");
  assert.equal(d.data[0]?.description, "Made for real tables.");
});
test("SHOP: nullable price means no displayed amount, never an invented one", () => {
  assert.equal(mapProduct(baseProduct)?.price, null);
  assert.equal(FALLBACK_PRODUCTS[0]?.price, null);
});
test("SHOP: a price with a supported currency is carried; without currency it is dropped", () => {
  assert.deepEqual(mapProduct({ ...baseProduct, price_amount: 5000, currency: "TZS" })?.price, {
    amount: 5000,
    currency: "TZS",
  });
  assert.equal(mapProduct({ ...baseProduct, price_amount: 5000, currency: null })?.price, null);
  assert.equal(mapProduct({ ...baseProduct, price_amount: 5000, currency: "USD" })?.price, null);
});
test("SHOP: sort order is respected with a deterministic tie-break", () => {
  const rows: ProductRow[] = [
    { ...baseProduct, id: "b", slug: "beta", name: "Beta", sort_order: 2 },
    { ...baseProduct, id: "a", slug: "alpha", name: "Alpha", sort_order: 2 },
    { ...baseProduct, id: "c", slug: "gamma", name: "Gamma", sort_order: 1 },
  ];
  const names = composeShop(okP(rows)).data.map((p) => p.name);
  assert.deepEqual(names, ["Gamma", "Alpha", "Beta"]);
  assert.deepEqual(
    orderProducts(composeShop(okP(rows)).data).map((p) => p.name),
    names,
  );
});
test("SHOP: an unpublished product is never rendered publicly", () => {
  assert.equal(mapProduct({ ...baseProduct, published: false }), null);
  assert.equal(composeShop(okP([{ ...baseProduct, published: false }])).source, "fallback");
});
test("SHOP: a malformed slug, empty name or unknown availability is refused", () => {
  assert.equal(mapProduct({ ...baseProduct, slug: "Bad Slug" }), null);
  assert.equal(mapProduct({ ...baseProduct, name: "   " }), null);
  assert.equal(mapProduct({ ...baseProduct, availability: "sold-out" }), null);
});
test("SHOP: the homepage teaser uses the featured product", () => {
  const other: ProductRow = {
    ...baseProduct,
    id: "x",
    slug: "other",
    name: "Other",
    featured: false,
    sort_order: 0,
  };
  assert.equal(teaserProduct(composeShop(okP([other, baseProduct]))).slug, "physical-cards");
});
test("SHOP: with no featured product the teaser is deterministic", () => {
  assert.equal(
    teaserProduct(composeShop(okP([{ ...baseProduct, featured: false }]))),
    FALLBACK_PRODUCTS[0],
  );
  assert.equal(teaserProduct(composeShop({ ok: false })).slug, "physical-cards");
});
test("SHOP: missing environment, query failure and empty result all fall back to Physical Cards", () => {
  for (const d of [composeShop({ ok: false }), composeShop(okP([]))]) {
    assert.equal(d.source, "fallback");
    assert.equal(d.data[0]?.name, "Physical Cards");
    assert.equal(d.data[0]?.price, null);
  }
});
test("SHOP: the fallback invents no stock, price or extra merchandise", () => {
  assert.equal(FALLBACK_PRODUCTS.length, 1);
  assert.equal(FALLBACK_PRODUCTS[0]?.availability, "coming_soon");
});

// ---- Shop presentation binding ----
test("BINDING: English state uses the English description", () => {
  assert.equal(
    localizedProductDescription(
      { description: "Made for tables.", descriptionSw: "Kwa meza." },
      "en",
    ),
    "Made for tables.",
  );
});
test("BINDING: Kiswahili state uses Kiswahili copy when it is valid, else English", () => {
  assert.equal(
    localizedProductDescription(
      { description: "Made for tables.", descriptionSw: "Kwa meza." },
      "sw",
    ),
    "Kwa meza.",
  );
  assert.equal(
    localizedProductDescription({ description: "Made for tables.", descriptionSw: null }, "sw"),
    "Made for tables.",
  );
  assert.equal(
    localizedProductDescription({ description: "Made for tables.", descriptionSw: "   " }, "sw"),
    "Made for tables.",
  );
});
test("BINDING: blank copy in both languages yields null, so the verified copy is used", () => {
  assert.equal(localizedProductDescription({ description: null, descriptionSw: null }, "en"), null);
  assert.equal(localizedProductDescription({ description: "  ", descriptionSw: null }, "sw"), null);
});
test("BINDING: price formatting uses a thousands separator and the currency", () => {
  assert.equal(formatPrice(5000, "TZS"), "5,000 TZS");
  assert.equal(formatPrice(130000, "TZS"), "130,000 TZS");
});

test("CMS winner photo replaces a seeded portrait and stays within the project media bucket", () => {
  const row = { ...W_ROWS[0]!, image_path: "winners/1234-photo-123.jpg" };
  const result = mapWinner(row, "uuid-26", "https://ickootmaamsrkfblqlyp.supabase.co");
  assert.equal(
    result?.portraitUrl,
    "https://ickootmaamsrkfblqlyp.supabase.co/storage/v1/object/public/site-media/winners/1234-photo-123.jpg",
  );
  assert.ok(
    result?.portrait,
    "the official fallback remains available if the upload fails to load",
  );
  const composed = composePublicContent(
    NOW,
    { ...cmsAll, champion: ok({ tournament: T26_ROW, winners: [row] }) },
    "https://ickootmaamsrkfblqlyp.supabase.co",
  );
  assert.equal(composed.winners.data[0]?.portraitUrl, result?.portraitUrl);
});
test("unpublished winners and external or traversing photo paths never expose uploads", () => {
  for (const image_path of [
    "https://evil.example/photo.jpg",
    "winners/../private.jpg",
    "products/other.png",
    "winners/photo.svg",
  ]) {
    assert.equal(
      mapWinner(
        { ...W_ROWS[0]!, image_path },
        "uuid-26",
        "https://ickootmaamsrkfblqlyp.supabase.co",
      )?.portraitUrl,
      undefined,
    );
  }
  assert.equal(
    mapWinner(
      { ...W_ROWS[0]!, published: false, image_path: "winners/photo.jpg" },
      "uuid-26",
      "https://ickootmaamsrkfblqlyp.supabase.co",
    ),
    null,
  );
});
