import type { ReactNode } from "react";
import { Picture } from "./Picture";
import { cn } from "@/lib/utils";

/**
 * Phone frame around the real Albastini app screenshot (cropped below the
 * personal profile bar). `sizes` should match the rendered width.
 */
export function PhoneMockup({
  className,
  alt,
  sizes,
  priority = false,
  children,
}: {
  className?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[13%/7%] bg-alba-ink p-[4.5%] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[10%/5.5%]">
        <Picture id="appHome" alt={alt} sizes={sizes} priority={priority} />
        {children}
      </div>
    </div>
  );
}
