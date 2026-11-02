import appHome from "@/assets/app-home-public.webp";
import { cn } from "@/lib/utils";

/**
 * Lightweight CSS phone frame showing a real Albastini app screenshot.
 * The screenshot is cropped below the profile bar so no personal account
 * name, avatar or balance is published.
 */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[500/899] w-[210px] rounded-[2rem] border-4 border-alba-ink bg-alba-ink p-2 shadow-lift sm:w-[240px]",
        className,
      )}
    >
      <div className="h-full w-full overflow-hidden rounded-[1.6rem]">
        <img
          src={appHome}
          alt="Albastini app home screen with Practice Mode, Head to Head, Tournament and How to Play"
          loading="lazy"
          width={500}
          height={899}
          className="h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}
