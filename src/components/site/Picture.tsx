import type { CSSProperties } from "react";
import { siteImages, type SiteImageId } from "@/content/assets";
import { cn } from "@/lib/utils";

/**
 * Responsive AVIF/WebP image from the asset registry.
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
  priority = false,
}: {
  id: SiteImageId;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  priority?: boolean;
}) {
  const { image } = siteImages[id];
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
        fetchPriority={priority ? "high" : "auto"}
        className={cn("block h-auto w-full", imgClassName)}
      />
    </picture>
  );
}
