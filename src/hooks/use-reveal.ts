import { useEffect, useRef, useState } from "react";

export type RevealState = "idle" | "armed" | "shown";

/**
 * Progressive reveal. Server HTML renders in the visible "idle" state.
 * On the client, an element that starts below the fold is "armed" (hidden),
 * then "shown" once it scrolls into view. Elements already on screen, and all
 * elements under prefers-reduced-motion, are never hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let first = true;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          setState(first ? "idle" : "shown");
          obs.disconnect();
        } else if (first) {
          setState("armed");
        }
        first = false;
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, state };
}
