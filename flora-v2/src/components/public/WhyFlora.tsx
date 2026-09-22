import {
  BadgeCheck,
  HeartHandshake,
  Layers3,
  Ruler,
  Sparkles,
  Wallet,
} from "lucide-react";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Premium Quality Materials",
    description:
      "Premium curtain fabrics, sheer and blackout collections, and finishes selected to last.",
  },
  {
    icon: Sparkles,
    title: "Modern & Customized Designs",
    description:
      "Contemporary and classic designs tailored to your space, style and requirements.",
  },
  {
    icon: Ruler,
    title: "Professional Installation Team",
    description:
      "Careful measurement and installation by an experienced curtain and upholstery team.",
  },
  {
    icon: Wallet,
    title: "Affordable Luxury Solutions",
    description:
      "A refined finish at a fair price — luxury that stays within reach.",
  },
  {
    icon: Layers3,
    title: "One-Stop Interior Solution",
    description:
      "Curtains, wallpaper, sofas, flooring and styling from a single trusted team.",
  },
  {
    icon: HeartHandshake,
    title: "Friendly & Reliable Service",
    description:
      "Clear communication and dependable follow-through from first visit to final fitting.",
  },
];

export function WhyFlora() {
  return (
    <div className="grid gap-x-5 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {reasons.map((reason) => {
        const Icon = reason.icon;

        return (
          <div
            key={reason.title}
            className="border-l border-flora-gold pl-5"
          >
            <Icon
              size={21}
              className="text-flora-primary"
            />

            <h3 className="mt-4 text-sm font-semibold text-flora-foreground">
              {reason.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-flora-muted">
              {reason.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
