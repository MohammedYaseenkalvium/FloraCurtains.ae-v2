import {
  Ruler,
  Layers3,
  BadgeCheck,
  Wrench,
} from "lucide-react";

const reasons = [
  {
    icon: Ruler,
    title: "Made to Measure",
    description:
      "Every window is considered individually so the finished treatment fits the space properly.",
  },
  {
    icon: Layers3,
    title: "Designed Around You",
    description:
      "Choose fabrics, finishes and functionality that complement your interior.",
  },
  {
    icon: BadgeCheck,
    title: "Attention to Detail",
    description:
      "From measurement to finishing, every stage is handled with care.",
  },
  {
    icon: Wrench,
    title: "Installation Support",
    description:
      "Professional installation helps ensure the finished result looks and functions as intended.",
  },
];

export function WhyFlora() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {reasons.map((reason) => {
        const Icon = reason.icon;

        return (
          <div
            key={reason.title}
            className="border-l border-[#C8A97E] pl-5"
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