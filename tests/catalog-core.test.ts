import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createWinner,
  updateWinner,
  setWinnerPublished,
  deleteWinner,
  moveWinner,
  createProduct,
  updateProduct,
  deleteProduct,
  validateImage,
  uploadImage,
  mediaPath,
  type Q,
  type StorageLike,
} from "../src/lib/admin/catalog-core";
import { winnerSchema, productSchema } from "../src/lib/admin/schemas";

type Reply = { data?: unknown[] | null; error?: { code?: string } | null };

/** Fake query builder. replies[table+op] = scripted result; every call is recorded. */
function fake(
  replies: Record<string, Reply>,
  rowsForOrder: { id: string; sort_order: number }[] = [],
) {
  const calls: {
    table: string;
    op: string;
    values?: Record<string, unknown>;
    eq?: [string, unknown];
  }[] = [];
  const reply = (key: string): Reply => replies[key] ?? { data: [], error: null };
  const q: Q = {
    from(table) {
      return {
        insert(values) {
          calls.push({ table, op: "insert", values });
          return { select: async () => reply(`${table}:insert`) as never };
        },
        update(values) {
          return {
            eq(column: string, value: unknown) {
              calls.push({ table, op: "update", values, eq: [column, value] });
              return {
                select: async () =>
                  (replies[`${table}:update:${String(value)}`] ??
                    reply(`${table}:update`)) as never,
              };
            },
          };
        },
        delete() {
          return {
            eq(column: string, value: unknown) {
              calls.push({ table, op: "delete", eq: [column, value] });
              return { select: async () => reply(`${table}:delete`) as never };
            },
          };
        },
        select() {
          return {
            eq() {
              return { order: async () => ({ data: rowsForOrder, error: null }) as never };
            },
          };
        },
      } as never;
    },
  };
  return { q, calls };
}

const TOURNAMENT = "00000000-0000-4000-8000-000000000026";
const ID = "00000000-0000-4000-8000-00000000000a";
const W = winnerSchema.parse({
  displayName: "Bedadi",
  placement: 2,
  location: "Kilimanjaro, Tanzania",
  prizeAmount: 65000,
  currency: "TZS",
  photoMode: "editorial-photo",
  imagePath: null,
  sortOrder: 2,
  published: true,
});

// ---- winners ----
test("winner create: a confirmed row is success and the correct fields are written", async () => {
  const { q, calls } = fake({ "winners:insert": { data: [{ id: "w1" }] } });
  assert.equal((await createWinner(q, TOURNAMENT, W)).ok, true);
  assert.equal(calls[0]?.values?.["display_name"], "Bedadi");
  assert.equal(calls[0]?.values?.["photo_mode"], "editorial-photo");
});
test("winner create: a duplicate rank is explained, not reported as a generic error", async () => {
  const r = await createWinner(
    fake({ "winners:insert": { error: { code: "23505" } } }).q,
    TOURNAMENT,
    W,
  );
  assert.equal(r.ok, false);
  assert.match(r.ok ? "" : r.error, /already has that rank/);
});
test("winner create: a database error is reported as failure", async () => {
  assert.equal(
    (await createWinner(fake({ "winners:insert": { error: { code: "XX000" } } }).q, TOURNAMENT, W))
      .ok,
    false,
  );
});
test("winner create: an RLS denial (zero rows, no error) is NOT reported as saved", async () => {
  assert.equal(
    (await createWinner(fake({ "winners:insert": { data: [] } }).q, TOURNAMENT, W)).ok,
    false,
  );
});
test("winner update: a confirmed update succeeds; a zero-row update is a failure", async () => {
  assert.equal(
    (await updateWinner(fake({ "winners:update": { data: [{ id: "w" }] } }).q, ID, TOURNAMENT, W))
      .ok,
    true,
  );
  assert.equal(
    (await updateWinner(fake({ "winners:update": { data: [] } }).q, ID, TOURNAMENT, W)).ok,
    false,
  );
});
test("publish and unpublish are confirmed by the database", async () => {
  assert.deepEqual(
    await setWinnerPublished(fake({ "winners:update": { data: [{ id: "w" }] } }).q, ID, false),
    {
      ok: true,
      data: false,
    },
  );
  assert.equal(
    (await setWinnerPublished(fake({ "winners:update": { data: [] } }).q, ID, true)).ok,
    false,
  );
});
test("winner delete: confirmed delete succeeds; zero-row denial is a failure", async () => {
  assert.equal(
    (await deleteWinner(fake({ "winners:delete": { data: [{ id: "w" }] } }).q, ID)).ok,
    true,
  );
  assert.equal((await deleteWinner(fake({ "winners:delete": { data: [] } }).q, ID)).ok, false);
});
test("winner reorder: moving up swaps sort order with the neighbour and writes both rows", async () => {
  const rows = [
    { id: "a", sort_order: 1 },
    { id: "b", sort_order: 2 },
    { id: "c", sort_order: 3 },
  ];
  const { q, calls } = fake({ "winners:update": { data: [{ id: "x" }] } }, rows);
  assert.equal((await moveWinner(q, TOURNAMENT, "b", "up")).ok, true);
  const writes = calls.filter((c) => c.op === "update");
  assert.deepEqual(
    writes.map((w) => [w.eq?.[1], w.values?.["sort_order"]]),
    [
      ["b", 1],
      ["a", 2],
    ],
  );
});
test("winner reorder at the edge changes nothing", async () => {
  const rows = [
    { id: "a", sort_order: 1 },
    { id: "b", sort_order: 2 },
  ];
  const { q, calls } = fake({}, rows);
  assert.equal((await moveWinner(q, TOURNAMENT, "a", "up")).ok, true);
  assert.equal(calls.filter((c) => c.op === "update").length, 0);
});
test("winner reorder: if the second write fails, the first is restored and the failure is reported", async () => {
  const rows = [
    { id: "a", sort_order: 1 },
    { id: "b", sort_order: 2 },
  ];
  // Moving 'b' up: the write to 'b' succeeds, the neighbour 'a' write fails, then 'b' is restored.
  const replies: Record<string, Reply> = {
    "winners:update:b": { data: [{ id: "b" }] },
    "winners:update:a": { data: [] },
  };
  const { q, calls } = fake(replies, rows);
  assert.equal((await moveWinner(q, TOURNAMENT, "b", "up")).ok, false);
  assert.equal(calls.filter((c) => c.op === "update").length, 3, "a restoring write is attempted");
});
test("winner validation: rank 4, negative prize and an unknown photo mode never reach the database", () => {
  assert.equal(winnerSchema.safeParse({ ...W, placement: 4 }).success, false);
  assert.equal(winnerSchema.safeParse({ ...W, prizeAmount: -5 }).success, false);
  assert.equal(winnerSchema.safeParse({ ...W, photoMode: "cutout" }).success, false);
});
test("MJeshi keeps its canonical spelling in validated data", () => {
  const m = winnerSchema.parse({
    ...W,
    displayName: "MJeshi",
    placement: 3,
    prizeAmount: 26000,
    location: "Iringa, Tanzania",
    photoMode: "portrait-cutout",
  });
  assert.equal(m.displayName, "MJeshi");
});

// ---- products ----
const P = productSchema.parse({
  slug: "physical-cards",
  category: "cards",
  name: "Physical Cards",
  description: null,
  nameSw: null,
  descriptionSw: null,
  imagePath: null,
  priceAmount: null,
  currency: null,
  availability: "coming_soon",
  featured: true,
  sortOrder: 1,
  published: true,
});
test("product create succeeds only when the database confirms the row", async () => {
  assert.equal(
    (await createProduct(fake({ "products:insert": { data: [{ id: "p" }] } }).q, P)).ok,
    true,
  );
  assert.equal((await createProduct(fake({ "products:insert": { data: [] } }).q, P)).ok, false);
});
test("product duplicate slug is explained", async () => {
  const r = await createProduct(fake({ "products:insert": { error: { code: "23505" } } }).q, P);
  assert.equal(r.ok, false);
  assert.match(r.ok ? "" : r.error, /slug already exists/);
});
test("product edit and delete are confirmed by the database", async () => {
  assert.equal(
    (await updateProduct(fake({ "products:update": { data: [{ id: "p" }] } }).q, ID, P)).ok,
    true,
  );
  assert.equal((await deleteProduct(fake({ "products:delete": { data: [] } }).q, ID)).ok, false);
  assert.equal(
    (await deleteProduct(fake({ "products:delete": { data: [{ id: "p" }] } }).q, ID)).ok,
    true,
  );
});
test("nullable price: Physical Cards with no price is valid; a price needs a currency", () => {
  assert.equal(productSchema.safeParse(P).success, true);
  assert.equal(productSchema.safeParse({ ...P, priceAmount: 5000 }).success, false);
  assert.equal(productSchema.safeParse({ ...P, priceAmount: 5000, currency: "TZS" }).success, true);
});
test("featured and availability are validated values", () => {
  assert.equal(productSchema.safeParse({ ...P, availability: "sold-out" }).success, false);
  assert.equal(productSchema.parse({ ...P, featured: false }).featured, false);
});
test("the seeded product slug is valid and must not contain spaces", () => {
  assert.equal(productSchema.safeParse({ ...P, slug: "Physical Cards" }).success, false);
});

// ---- media ----
test("image validation: allowed MIME types and size limit", () => {
  assert.equal(validateImage({ type: "image/png", size: 1000 }).ok, true);
  assert.equal(validateImage({ type: "image/svg+xml", size: 1000 }).ok, false);
  assert.equal(validateImage({ type: "application/pdf", size: 1000 }).ok, false);
  assert.equal(validateImage({ type: "image/webp", size: 6 * 1024 * 1024 }).ok, false);
  assert.equal(validateImage({ type: "image/jpeg", size: 0 }).ok, false);
});
test("media paths are generated under the allowed folder with a server-chosen name", () => {
  assert.match(mediaPath("winners", "w1", "image/png"), /^winners\/w1-\d+\.png$/);
});
test("upload: a storage error never produces a stored path", async () => {
  const storage: StorageLike = {
    from: () => ({ upload: async () => ({ data: null, error: { message: "denied" } }) }),
  };
  assert.equal(
    (await uploadImage(storage, "winners", "w1", { type: "image/png", size: 100 }, new Blob(["x"])))
      .ok,
    false,
  );
});
test("upload: an empty success response is not treated as a saved file", async () => {
  const storage: StorageLike = {
    from: () => ({ upload: async () => ({ data: null, error: null }) }),
  };
  assert.equal(
    (
      await uploadImage(
        storage,
        "products",
        "p1",
        { type: "image/png", size: 100 },
        new Blob(["x"]),
      )
    ).ok,
    false,
  );
});
test("upload: a confirmed upload returns the stored path", async () => {
  const storage: StorageLike = {
    from: () => ({ upload: async (path: string) => ({ data: { path }, error: null }) }),
  };
  const r = await uploadImage(
    storage,
    "winners",
    "w1",
    { type: "image/webp", size: 100 },
    new Blob(["x"]),
  );
  assert.equal(r.ok && /^winners\/w1-\d+\.webp$/.test(r.data), true);
});
test("an invalid file is refused before any upload is attempted", async () => {
  let attempted = false;
  const storage: StorageLike = {
    from: () => ({
      upload: async () => {
        attempted = true;
        return { data: null, error: null };
      },
    }),
  };
  await uploadImage(storage, "winners", "w1", { type: "text/html", size: 10 }, new Blob(["x"]));
  assert.equal(attempted, false);
});
