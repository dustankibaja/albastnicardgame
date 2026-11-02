import { useEffect, type RefObject } from "react";

/*
 * Lightweight depth/parallax. No animation library.
 *
 * - One shared scroll listener + rAF for every registered element.
 * - Elements only update while on screen (IntersectionObserver).
 * - Writes a single CSS variable; CSS does the transform (compositor only).
 * - Disabled entirely under prefers-reduced-motion.
 */

const reduced = () =>
  typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const active = new Set<HTMLElement>();
let ticking = false;

function update() {
  ticking = false;
  const vh = window.innerHeight;
  for (const el of active) {
    const r = el.getBoundingClientRect();
    // -1 when the element's centre is a full viewport below centre, +1 above.
    const p = ((vh / 2 - (r.top + r.height / 2)) / (vh + r.height)) * 2;
    el.style.setProperty("--p", Math.max(-1, Math.min(1, p)).toFixed(4));
  }
}
function schedule() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}

let listeners = 0;
function attach() {
  if (listeners++ === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }
}
function detach() {
  if (--listeners === 0) {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  }
}

/** Sets `--p` (-1 … 1) on the element as it crosses the viewport. */
export function useScrollProgress<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === "undefined") return;
    attach();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          active.add(el);
          schedule();
        } else active.delete(el);
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      active.delete(el);
      detach();
    };
  }, [ref]);
}

/**
 * Sets `--mx` / `--my` (-1 … 1) from the pointer over the element.
 * Mouse/trackpad only (hover-capable fine pointers); eased so it never
 * snaps or chases the cursor; the loop stops once settled.
 */
export function usePointerDepth<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      raf = 0;
    const step = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--mx", x.toFixed(4));
      el.style.setProperty("--my", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}
