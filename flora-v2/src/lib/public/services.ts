export interface ServiceOffering {
  slug: string;
  title: string;
  description: string;
  offerings: string[];
  emphasis: string;
  image: string;
  imageAlt: string;
}

export const services: ServiceOffering[] = [
  {
    slug: "curtains-blinds",
    imageAlt: "Sheer and blackout curtains in a bright Abu Dhabi villa living room",
    title: "Curtains & Blinds",
    description:
      "Premium curtains, blackout, sheer and motorized blinds in Abu Dhabi — measured, customized and installed with a perfect finish across the UAE.",
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
    image: "/images/portfolio-1.jpg",
  },
  {
    slug: "wallpaper",
    imageAlt: "Textured designer wallpaper in a modern UAE home interior",
    title: "Wallpaper Solutions",
    description:
      "Luxury wallpapers with seamless installation and a premium finish for villas and offices in Abu Dhabi and the UAE.",
    offerings: [
      "Contemporary Designs",
      "Textured Wallpapers",
      "Luxury Patterns",
      "Minimal & Modern Styles",
      "Feature Wall Concepts",
    ],
    emphasis: "Luxury materials with seamless installation and a premium finish.",
    image: "/images/service-wallpaper.jpg",
  },
  {
    slug: "sofas-upholstery",
    imageAlt: "Custom-made sofa with premium upholstery fabric in a living room",
    title: "Customized Sofas & Upholstery",
    description:
      "Custom-made sofas and reupholstery crafted for comfort and durability — premium fabrics, modern and classic designs across the UAE.",
    offerings: [
      "Custom-Made Sofas",
      "Reupholstery Services",
      "Premium Fabric Selection",
      "Modern & Classic Designs",
      "Cushion & Headboard Customization",
    ],
    emphasis: "Comfort, customization and craftsmanship with curated fabric selection.",
    image: "/images/service-sofa.jpg",
  },
  {
    slug: "interior-decoration",
    imageAlt: "Elegant villa interior styling with curtains and coordinated furnishings",
    title: "Interior Decoration",
    description:
      "Personalized interior styling for homes and offices in Abu Dhabi — functional, modern and elegant decoration across the UAE.",
    offerings: [
      "Home Interior Styling",
      "Villa & Apartment Decoration",
      "Office Interior Solutions",
      "Space Planning",
      "Color & Material Selection",
    ],
    emphasis: "Personalization, functionality and modern elegance.",
    image: "/images/service-interior.jpg",
  },
  {
    slug: "flooring",
    imageAlt: "Wooden flooring installation in a contemporary UAE apartment",
    title: "Carpet & Wooden Flooring",
    description:
      "Durable carpets, vinyl, laminate and wooden flooring with professional installation and a refined finish across the UAE.",
    offerings: [
      "Wall-to-Wall Carpets",
      "Vinyl Flooring",
      "Wooden Flooring",
      "Laminate Flooring",
      "Custom Carpet Installation",
    ],
    emphasis: "Durable materials, professional installation and a lasting finish.",
    image: "/images/service-flooring.jpg",
  },
];
