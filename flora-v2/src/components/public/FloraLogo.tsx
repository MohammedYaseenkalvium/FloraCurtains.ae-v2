import Image from "next/image";
import type { CSSProperties } from "react";

export const FLORA_LOGO_SRC = "/images/flora-logo.png";

interface FloraLogoProps {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  /** White treatment for dark photographic backdrops (CSS only — file untouched). */
  inverted?: boolean;
}

/**
 * Single source of truth for the Flora Curtains brand mark on the
 * public website. Always renders the approved asset, never a redraw.
 */
export function FloraLogo({
  width = 176,
  height = 44,
  className = "h-11 w-auto object-contain",
  style,
  priority = false,
  inverted = false,
}: FloraLogoProps) {
  return (
    <Image
      src={FLORA_LOGO_SRC}
      alt="Flora Curtains"
      width={width}
      height={height}
      priority={priority}
      // Inline auto dimensions silence Next's aspect-ratio warning when
      // utility classes (h-11 w-auto) resize the intrinsic 176×44 asset.
      style={{ width: "auto", height: "auto", ...style }}
      className={`${className}${inverted ? " brightness-0 invert" : ""}`}
    />
  );
}
