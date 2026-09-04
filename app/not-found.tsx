import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-100">Base not found</h1>
      <p className="mt-3 text-sm text-slate-500">
        This layout may have been removed, or the page doesn&rsquo;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
      >
        Back to home
      </Link>
    </div>
  );
}
