import { AlbaButton, type AlbaButtonProps } from "./AlbaButton";
import { useDownload } from "./DownloadModal";

/**
 * APP CTA family. Every "download / play on the app" action uses this button,
 * so they all look and behave the same (yellow primary, opens the store dialog).
 */
export function DownloadButton({ variant: _v, onClick, ...props }: AlbaButtonProps) {
  const { openDownload } = useDownload();
  return (
    <AlbaButton
      {...props}
      type="button"
      variant="primary"
      aria-haspopup="dialog"
      onClick={(e) => {
        onClick?.(e);
        openDownload();
      }}
    />
  );
}
