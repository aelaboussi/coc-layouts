function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ["#1b3a2f", "#2f6b4f", "#f2b544", "#e0722f"],
  ["#1c2e4a", "#2d5a8c", "#f2b544", "#7ac6d6"],
  ["#3a1b3a", "#7a2f6b", "#f2b544", "#e05c9e"],
  ["#2a2118", "#6b4a2f", "#f2b544", "#c94f4f"],
  ["#12312b", "#1f6b5c", "#f2d544", "#4fc9a0"],
];

/**
 * Procedurally generated top-down "base grid" artwork used in place of real
 * screenshots. Deterministic per `seed`, so the same base always renders the
 * same thumbnail. Swap for real layout screenshots when wiring up live data.
 */
export default function BaseThumb({
  seed,
  className = "",
}: {
  seed: number;
  className?: string;
}) {
  const rng = mulberry32(seed);
  const palette = PALETTES[Math.floor(rng() * PALETTES.length) % PALETTES.length];
  const [bg, wall, accent, accent2] = palette;

  const cells = 8;
  const size = 100 / cells;
  const blocks: { x: number; y: number; w: number; h: number; color: string }[] =
    [];

  for (let i = 0; i < 14; i++) {
    const w = 1 + Math.floor(rng() * 2);
    const h = 1 + Math.floor(rng() * 2);
    const x = Math.floor(rng() * (cells - w));
    const y = Math.floor(rng() * (cells - h));
    const roll = rng();
    const color = roll < 0.5 ? wall : roll < 0.8 ? accent : accent2;
    blocks.push({ x: x * size, y: y * size, w: w * size, h: h * size, color });
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Generated base layout preview"
    >
      <rect width="100" height="100" fill={bg} />
      <rect
        x="1"
        y="1"
        width="98"
        height="98"
        fill="none"
        stroke={accent}
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x + 3}
          y={b.y + 3}
          width={Math.max(b.w - 6, 3)}
          height={Math.max(b.h - 6, 3)}
          rx="1.2"
          fill={b.color}
          opacity="0.92"
        />
      ))}
      <circle cx="50" cy="50" r="4" fill={accent} opacity="0.9" />
    </svg>
  );
}
