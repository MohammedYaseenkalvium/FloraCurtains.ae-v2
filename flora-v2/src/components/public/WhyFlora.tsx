const reasons = [
  {
    title: "Premium Quality Materials",
    description:
      "Premium curtain fabrics, sheer and blackout collections, and finishes selected to last.",
  },
  {
    title: "Modern & Customized Designs",
    description:
      "Contemporary and classic designs tailored to your space, style and requirements.",
  },
  {
    title: "Expert Craftsmanship",
    description:
      "Decades of hands-on curtain and upholstery craft in every stitch and fitting.",
  },
  {
    title: "Professional Installation",
    description:
      "Careful measurement and installation by an experienced in-house team.",
  },
  {
    title: "UAE-Wide Service",
    description:
      "Villas, apartments, offices and commercial projects across all Emirates.",
  },
  {
    title: "Complete Solution",
    description:
      "Curtains, wallpaper, sofas, flooring and styling from a single trusted team.",
  },
];

/** Editorial numbered index — not SaaS feature cards. */
export function WhyFlora() {
  return (
    <ol className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      {reasons.map((reason, i) => (
        <li key={reason.title} className="border-t border-flora-border pt-6">
          <p aria-hidden="true" className="font-display text-4xl leading-none text-flora-gold">
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-flora-foreground">
            {reason.title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-flora-muted">
            {reason.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
