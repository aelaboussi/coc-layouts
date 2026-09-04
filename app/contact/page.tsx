import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-4 text-2xl font-bold text-slate-100">Contact Us</h1>
      <p className="mb-6 text-sm text-slate-400">
        Found a broken layout, have feedback, or want to submit a base?
        Reach out below.
      </p>
      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Name
          <input
            type="text"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Email
          <input
            type="email"
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-slate-300">
          Message
          <textarea
            rows={5}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
