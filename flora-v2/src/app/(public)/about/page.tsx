import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhyFlora } from "@/components/public/WhyFlora";

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-[#D8C9BC]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
            About Flora
          </span>

          <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight text-[#1E1B18] sm:text-6xl">
            Creating window
            <br />
            treatments with
            <br />
            <span className="text-[#5A0E12]">
              purpose and character.
            </span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl text-[#1E1B18]">
              Our story
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-[#6B625A]">
            <p>
              Flora Curtains was established in 2023 with
              a focus on creating considered curtain, blind
              and window treatment solutions.
            </p>

            <p>
              Our approach combines practical experience,
              careful measurement and attention to the
              details that make a finished interior feel
              complete.
            </p>

            <p>
              Every project is different. Our role is to
              understand the space, the requirements and
              the desired result, then develop a solution
              that fits.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#D8C9BC] bg-[#F8F5F2]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
              Why Flora
            </span>

            <h2 className="mt-3 font-serif text-4xl text-[#1E1B18] sm:text-5xl">
              A considered process.
            </h2>
          </div>

          <WhyFlora />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
        <h2 className="font-serif text-4xl text-[#1E1B18] sm:text-5xl">
          Let&apos;s talk about
          <br />
          your space.
        </h2>

        <Link
          href="/contact"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#5A0E12] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#74171C]"
        >
          Start a Conversation
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}