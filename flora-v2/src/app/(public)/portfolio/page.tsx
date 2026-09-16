const projects = [
  {
    title: "Residential Interiors",
    category: "Residential",
    image: "/images/portfolio-1.jpg",
  },
  {
    title: "Contemporary Window Treatments",
    category: "Interior",
    image: "/images/portfolio-2.jpg",
  },
  {
    title: "Commercial Spaces",
    category: "Commercial",
    image: "/images/portfolio-3.jpg",
  },
  {
    title: "Bespoke Curtain Installation",
    category: "Residential",
    image: "/images/portfolio-4.jpg",
  },
  {
    title: "Elegant Living Spaces",
    category: "Residential",
    image: "/images/portfolio-5.jpg",
  },
  {
    title: "Modern Office Treatments",
    category: "Commercial",
    image: "/images/portfolio-6.jpg",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <section className="border-b border-[#D8C9BC]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
            Portfolio
          </span>

          <h1 className="mt-4 font-serif text-5xl leading-tight text-[#1E1B18] sm:text-6xl">
            Selected work.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[#6B625A]">
            A selection of spaces and window treatments
            created with attention to proportion, material
            and function.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.title}
              className="overflow-hidden rounded-xl border border-[#D8C9BC] bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F8F5F2]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                  {project.category}
                </p>

                <h2 className="mt-2 font-semibold text-[#1E1B18]">
                  {project.title}
                </h2>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}