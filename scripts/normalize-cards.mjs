/**
 * Normalise the official card pack onto ONE canonical canvas — non-destructively.
 *
 *   node scripts/normalize-cards.mjs
 *
 * Rules (owner decision D3):
 *  - originals are never modified (read-only input);
 *  - every card is FITTED (contain), never cropped: uniform scale only, so no
 *    artwork is lost and nothing is distorted;
 *  - cards are centred on a transparent canvas, so fronts and back share
 *    identical flip geometry (same canvas, same centre, same pivot);
 *  - the card edge is found from alpha, so the shadow/padding the source files
 *    carried is replaced by one consistent margin.
 * Output: assets-source/official-cards/normalized/*.png (1024×1536, RGBA)
 *         + normalization-report.json (every number used by the M0 geometry board).
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC = "assets-source/official-cards/Temporary_Reconstructed_Individual_Cards";
const OUT = "assets-source/official-cards/normalized";
const CANVAS = { w: 1024, h: 1536 };
// Canonical card box inside the canvas: poker-like 1:1.4, with a consistent margin.
const BOX = { w: 920, h: 1288 };

const files = [
  ...(await fs.readdir(path.join(SRC, "Fronts"))).filter((f) => f.endsWith(".png")).sort().map((f) => ["front", path.join(SRC, "Fronts", f)]),
  ...(await fs.readdir(path.join(SRC, "Back"))).filter((f) => f.endsWith(".png")).sort().map((f) => ["back", path.join(SRC, "Back", f)]),
];

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

const report = { canvas: CANVAS, box: BOX, cards: [] };
for (const [kind, file] of files) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const s = Math.min(BOX.w / w, BOX.h / h); // CONTAIN: never crop
  const pw = Math.round(w * s), ph = Math.round(h * s);
  const card = await sharp(file).extract({ left: x0, top: y0, width: w, height: h }).resize(pw, ph, { kernel: "lanczos3" }).png().toBuffer();
  const left = Math.round((CANVAS.w - pw) / 2), top = Math.round((CANVAS.h - ph) / 2);
  const name = path.basename(file).replace(/_TEMP/i, "").replace(/\.png$/, "");
  await sharp({ create: { width: CANVAS.w, height: CANVAS.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: card, left, top }]).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`));
  report.cards.push({
    id: name, kind, source: { w, h, ratio: +(h / w).toFixed(3) },
    scale: +s.toFixed(4), placed: { w: pw, h: ph, ratio: +(ph / pw).toFixed(3) },
    padding: { x: left, y: top }, fills: { w: +(pw / BOX.w).toFixed(3), h: +(ph / BOX.h).toFixed(3) },
    cropPct: 0, upscaled: s > 1,
  });
}
await fs.writeFile(path.join(OUT, "normalization-report.json"), JSON.stringify(report, null, 2));
console.log(report.cards.map((c) => `${c.id.padEnd(34)} ${c.kind.padEnd(5)} src ${c.source.w}×${c.source.h} (${c.source.ratio})  scale ${c.scale}  → ${c.placed.w}×${c.placed.h}  crop ${c.cropPct}%`).join("\n"));
