import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "outreach", short_name: "outreach", start_url: "/", display: "standalone", background_color: "#f6f6f3", theme_color: "#f6f6f3", icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }] };
}
