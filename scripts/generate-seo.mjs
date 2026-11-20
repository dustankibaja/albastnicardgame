/**
 * Writes public/sitemap.xml and the robots.txt Sitemap line ONLY when the
 * verified production origin is provided:  VITE_SITE_URL=https://… npm run build
 * Without it, any stale sitemap is removed and robots.txt has no Sitemap line,
 * so nothing points crawlers at an unverified domain.
 */
import fs from "node:fs/promises";

const url = process.env.VITE_SITE_URL?.replace(/\/+$/, "");
const robots = ["User-agent: *", "Allow: /"];

if (url && /^https:\/\//.test(url)) {
  const today = new Date().toISOString().slice(0, 10);
  await fs.writeFile(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><lastmod>${today}</lastmod></url>\n  <url><loc>${url}/shop</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
  );
  robots.push("", `Sitemap: ${url}/sitemap.xml`);
  console.log(`seo: sitemap for ${url}`);
} else {
  await fs.rm("public/sitemap.xml", { force: true });
  console.log("seo: VITE_SITE_URL not set — no sitemap, no canonical (by design)");
}
await fs.writeFile("public/robots.txt", robots.join("\n") + "\n");
