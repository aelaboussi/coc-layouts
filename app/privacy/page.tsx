import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-slate-400">
      <h1 className="mb-4 text-2xl font-bold text-slate-100">
        Privacy Policy
      </h1>

      <p className="mb-4">
        This policy explains what {siteConfig.name} collects and how it&rsquo;s
        used. This is a small, independently run site — nothing here is sold
        or shared beyond what&rsquo;s described below.
      </p>

      <h2 className="mb-2 mt-6 text-base font-semibold text-slate-200">
        Information we collect
      </h2>
      <p className="mb-4">
        We record star ratings and page views for individual base layouts so
        we can show accurate, real statistics (see the ratings and view
        counts on each base). A rating is tied to your browser via a small
        local storage entry, not to any personal account — we don&rsquo;t
        collect names, emails, or other identifying information as part of
        rating or browsing the site.
      </p>

      <h2 className="mb-2 mt-6 text-base font-semibold text-slate-200">
        Cookies and advertising
      </h2>
      <p className="mb-4">
        This site may show ads served by Google AdSense. Google and its
        partners use cookies and similar technologies to serve ads based on
        your prior visits to this and other websites, and to measure ad
        performance. You can learn more about how Google uses this data, and
        control your ad personalization settings, at{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline"
        >
          google.com/settings/ads
        </a>{" "}
        and{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline"
        >
          policies.google.com/technologies/partner-sites
        </a>
        . If you&rsquo;re in a region where consent is required (e.g. under
        GDPR or CCPA), we aim to honor your browser&rsquo;s or device&rsquo;s
        ad-personalization preferences.
      </p>

      <h2 className="mb-2 mt-6 text-base font-semibold text-slate-200">
        Third-party links
      </h2>
      <p className="mb-4">
        Base layout links open directly in the Clash of Clans app or on
        Supercell&rsquo;s own domains — we don&rsquo;t control what those
        destinations collect once you leave this site.
      </p>

      <h2 className="mb-2 mt-6 text-base font-semibold text-slate-200">
        Changes to this policy
      </h2>
      <p className="mb-4">
        We may update this policy as the site changes. Check back
        occasionally if you have concerns.
      </p>

      <p>This is an unofficial fan site and is not affiliated with Supercell.</p>
    </div>
  );
}
