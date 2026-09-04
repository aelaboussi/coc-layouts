import { siteConfig } from "@/lib/site-config";

// ads.txt has to live at the domain root as plain text. Without it (or with
// a mismatched publisher ID), Google won't auction ads on this domain at
// all — it's not optional despite looking like a formality. Generated from
// site-config so it can never drift from the client ID used in the loader
// script (app/layout.tsx).
//
// Format: https://support.google.com/adsense/answer/9825827
// The trailing hash is Google's own reseller-verification value for
// AdSense, documented at https://support.google.com/adsense/answer/9276403
export async function GET() {
  if (!siteConfig.adsenseClientId) {
    return new Response("", { headers: { "Content-Type": "text/plain" } });
  }
  const pubId = siteConfig.adsenseClientId.replace(/^ca-/, "");
  const body = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
