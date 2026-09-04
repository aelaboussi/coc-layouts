import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-slate-400">
      <h1 className="mb-4 text-2xl font-bold text-slate-100">
        Privacy Policy
      </h1>
      <p className="mb-4">
        Placeholder privacy policy. Replace this page with your real policy
        before launch — it should cover what data you collect, how cookies
        and analytics are used, and how third-party advertising (e.g. Google
        AdSense / Google Ad Manager) uses cookies to serve ads, once ads are
        enabled on this site.
      </p>
      <p className="mb-4">
        When you turn on Google ads, you will need to disclose use of
        personalization/advertising cookies and provide a consent mechanism
        where required (e.g. GDPR/CCPA), and link to Google&rsquo;s own
        policies on data use.
      </p>
      <p>This is an unofficial fan site and is not affiliated with Supercell.</p>
    </div>
  );
}
