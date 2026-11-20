import { useEffect, useState } from "react";

/*
 * Robust scene + active-section detection.
 *
 * Uses IntersectionObserver with a band near the top of the viewport
 * (rootMargin), not scroll pixels, so it stays correct when the viewport
 * height, fonts, language or content change. A section is "active" while it
 * occupies the band under the navigation bar. When no band intersects (between
 * sections, or at the very top), the previous answer is kept.
 */
export function useActiveSection(ids: readonly string[], navHeightPx: number) {
  const [active, setActive] = useState<string | null>(null);
  const idKey = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;

    // The band: from just under the nav bar to ~40% of the viewport height.
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (hit.length) setActive(hit[0]!.target.id);
      },
      { rootMargin: `-${navHeightPx}px 0px -60% 0px`, threshold: 0 },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey, navHeightPx]);

  return active;
}
