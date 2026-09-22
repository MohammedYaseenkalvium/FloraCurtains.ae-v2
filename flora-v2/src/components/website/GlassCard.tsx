interface GlassCardProps {
  eyebrow: string;
  value: string;
  description: string;
}

/**
 * Dark-glass floating card (hero/stats use only):
 * white 12%, blur 18px, white/20 border. Never for body copy.
 */
export function GlassCard({ eyebrow, value, description }: GlassCardProps) {
  return (
    <div
      className="rounded-2xl p-6 text-white shadow-flora-lg"
      style={{
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255, 255, 255, 0.20)",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
        {eyebrow}
      </p>
      <p className="mt-3 font-display text-5xl leading-none">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/75">{description}</p>
    </div>
  );
}
