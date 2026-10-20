import { ImageResponse } from "next/og";
import { appIcon } from "@/lib/og";

// Apple touch icon (the /apple-icon.png Next serves here is referenced by app/manifest.ts).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(appIcon(), { ...size });
}
