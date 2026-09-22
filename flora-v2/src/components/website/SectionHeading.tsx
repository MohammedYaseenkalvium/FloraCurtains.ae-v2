interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
}

/** Editorial section heading: eyebrow + display title + lede. */
export function SectionHeading({ eyebrow, title, description, align = "left", dark = false }: SectionHeadingProps) {
  const alignCls = align === "center" ? "mx-auto text-center items-center" : "items-start";
  return (
    <div className={`mb-12 flex max-w-2xl flex-col ${alignCls}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-flora-gold">
        {eyebrow}
      </span>
      <h2 className={`mt-4 font-display text-4xl leading-[1.05] sm:text-5xl ${dark ? "text-white" : "text-flora-foreground"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-base leading-7 ${dark ? "text-white/75" : "text-flora-muted"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
