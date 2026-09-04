import Link from "next/link";
import WatermarkedImage from "./WatermarkedImage";
import RatingStars from "./RatingStars";
import { BaseLayout, CATEGORY_LABELS } from "@/lib/types";

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Cheap deterministic int from the id, only used to pick a fallback
// placeholder pattern if the real image fails to load.
function seedFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

export default function BaseCard({ base }: { base: BaseLayout }) {
  return (
    <Link
      href={`/${base.hallType}/${base.level}/${base.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="relative aspect-square w-full">
        <WatermarkedImage
          src={base.image}
          alt={base.title}
          seed={seedFromId(base.id)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2 top-2 rounded-md bg-slate-950/80 px-2 py-0.5 text-[11px] font-medium text-amber-400 backdrop-blur">
          {CATEGORY_LABELS[base.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-100 group-hover:text-amber-400">
          {base.title}
        </h3>
        <RatingStars rating={base.rating} count={base.ratingCount} />
        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <span>Added {timeAgo(base.addedAt)}</span>
          <span className="truncate pl-2">{base.builder.split(" ")[0]}</span>
        </div>
      </div>
    </Link>
  );
}
