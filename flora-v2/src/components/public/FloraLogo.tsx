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
  width = 132,
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
      // No inline dimensions: the width/height props carry the master asset's
      // true ~3:1 aspect (2170x725) so the className utilities govern the
      // rendered box. Inline width/height auto would outrank the classes and
      // silently reimpose the prop box; truthful props also keep Next's
      // exactly-one-dimension-modified aspect warning quiet.
      style={style}
      className={`${className}${inverted ? " brightness-0 invert" : ""}`}
    />
  );
}
