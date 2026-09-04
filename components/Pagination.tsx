import Link from "next/link";

function buildHref(pathname: string, params: URLSearchParams, page: number) {
  const p = new URLSearchParams(params.toString());
  if (page <= 1) p.delete("page");
  else p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Numbered pagination with prev/next and ellipsis for long ranges. */
export default function Pagination({
  pathname,
  searchParams,
  page,
  totalPages,
}: {
  pathname: string;
  searchParams: URLSearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });

  const linkClass = (active: boolean) =>
    `flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition ${
      active
        ? "border-amber-500 bg-amber-500/10 text-amber-400"
        : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
    }`;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={buildHref(pathname, searchParams, Math.max(1, page - 1))}
        className={linkClass(false)}
        aria-disabled={page === 1}
        tabIndex={page === 1 ? -1 : undefined}
      >
        ‹
      </Link>
      {items.map((it, i) =>
        it === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-600">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={buildHref(pathname, searchParams, it)}
            className={linkClass(it === page)}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </Link>
        )
      )}
      <Link
        href={buildHref(pathname, searchParams, Math.min(totalPages, page + 1))}
        className={linkClass(false)}
        aria-disabled={page === totalPages}
        tabIndex={page === totalPages ? -1 : undefined}
      >
        ›
      </Link>
    </nav>
  );
}
