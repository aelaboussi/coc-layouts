"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import BaseThumb from "./BaseThumb";

/**
 * Real base-layout screenshot, lazy-loaded via next/image (unless
 * `priority` for above-the-fold hero images), with:
 *  - a skeleton shimmer until the image finishes loading (no layout shift —
 *    the container reserves the aspect ratio up front)
 *  - a text watermark overlay, configured centrally in lib/site-config.ts
 *  - a graceful fallback to the generated placeholder art if the source
 *    image 404s (the dataset aggregates images from several third-party
 *    hosts, so occasional link rot is expected)
 */
export default function WatermarkedImage({
  src,
  alt,
  seed,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  seed: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-slate-950 ${className}`}>
      {errored ? (
        <BaseThumb seed={seed} className="h-full w-full" />
      ) : (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-800/60" />
          )}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={`object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        </>
      )}
      {!errored && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 right-1.5 select-none rounded bg-slate-950/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur-sm"
        >
          {siteConfig.imageWatermarkText}
        </span>
      )}
    </div>
  );
}
