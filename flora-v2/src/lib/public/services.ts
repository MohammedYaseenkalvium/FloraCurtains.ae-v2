export interface ServiceOffering {
  slug: string;
  title: string;
  description: string;
  offerings: string[];
  emphasis: string;
}

export const services: ServiceOffering[] = [
  {
    slug: "curtains-blinds",
    title: "Curtains & Blinds",
    description:
      "Premium curtains and smart window solutions designed for style, functionality and a perfect finish.",
    offerings: [
      "Blackout Curtains",
      "Sheer Curtains",
      "Motorized Curtains",
      "Roller Blinds",
      "Roman Blinds",
      "Venetian Blinds",
      "Wooden Blinds",
      "Custom Designs & Installation",
    ],
    emphasis: "Professional measurement, customization and installation with finishing quality.",
  },
  {
    slug: "wallpaper",
    title: "Wallpaper Solutions",
    description:
      "Luxury wallpapers with seamless installation and a premium finish for any room.",
    offerings: [
      "Contemporary Designs",
      "Textured Wallpapers",
      "Luxury Patterns",
      "Minimal & Modern Styles",
      "Feature Wall Concepts",
    ],
    emphasis: "Luxury materials with seamless installation and a premium finish.",
  },
  {
    slug: "sofas-upholstery",
    title: "Customized Sofas & Upholstery",
    description:
      "Custom-made sofas and reupholstery crafted for comfort, durability and your interior.",
    offerings: [
      "Custom-Made Sofas",
      "Reupholstery Services",
      "Premium Fabric Selection",
      "Modern & Classic Designs",
      "Cushion & Headboard Customization",
    ],
    emphasis: "Comfort, customization and craftsmanship with curated fabric selection.",
  },
  {
    slug: "interior-decoration",
    title: "Interior Decoration",
    description:
      "Personalized interior styling for homes and offices — functional, modern and elegant.",
    offerings: [
      "Home Interior Styling",
      "Villa & Apartment Decoration",
      "Office Interior Solutions",
      "Space Planning",
      "Color & Material Selection",
    ],
    emphasis: "Personalization, functionality and modern elegance.",
  },
  {
    slug: "flooring",
    title: "Carpet & Wooden Flooring",
    description:
      "Durable carpets and flooring with professional installation and a refined finish.",
    offerings: [
      "Wall-to-Wall Carpets",
      "Vinyl Flooring",
      "Wooden Flooring",
      "Laminate Flooring",
      "Custom Carpet Installation",
    ],
    emphasis: "Durable materials, professional installation and a lasting finish.",
  },
];
