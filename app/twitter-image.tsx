import { ImageResponse } from "next/og";
import { socialCard } from "@/lib/og";

// Same artwork as opengraph-image; the file convention keeps twitter:image in sync.
export const alt = "EduPortal — Learn, Build, Grow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(socialCard(), { ...size });
}
