import { ImageResponse } from "next/og";
import { socialCard } from "@/lib/og";

// Site-wide default social card. Next attaches it to every route's Open Graph metadata unless the
// page sets its own `openGraph.images` (the blog articles use their own thumbnails).
export const alt = "EduPortal — Learn, Build, Grow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(socialCard(), { ...size });
}
