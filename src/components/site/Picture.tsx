import type { CSSProperties } from "react";
import { siteImages, type SiteImageId } from "@/content/assets";
import { cn } from "@/lib/utils";

/**
 * Responsive AVIF/WebP image from the asset registry. Renders nothing for
 * registry slots that are still awaiting a genuine asset.
 * `sizes` must describe the real rendered width so the browser picks the
 * smallest file that stays sharp.
 */
export function Picture({
  id,
  alt,
  sizes,
  className,
  imgClassName,
  style,
  imgStyle,
  priority = false,
}: {
  id: SiteImageId;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** Applied to the <img> itself (e.g. objectPosition). */
  imgStyle?: CSSProperties;
  priority?: boolean;
}) {
  const { image } = siteImages[id];
  // Slot awaiting a genuine asset: render nothing (never a placeholder).
  if (!image) return null;
  const srcSet = (list: [string, number][]) => list.map(([src, w]) => `${src} ${w}w`).join(", ");
  const fallback = image.webp[image.webp.length - 1]!;
  return (
    <picture className={cn("block", className)} style={style}>
      <source type="image/avif" srcSet={srcSet(image.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.webp)} sizes={sizes} />
      <img
        src={fallback[0]}
        alt={alt}
        width={image.width}
        height={Math.round(image.width * image.ratio)}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // Non-hero images never compete with the hero for bandwidth.
        fetchPriority={priority ? "high" : "low"}
        className={cn("block h-auto w-full", imgClassName)}
        style={imgStyle}
      />
    </picture>
  );
}
