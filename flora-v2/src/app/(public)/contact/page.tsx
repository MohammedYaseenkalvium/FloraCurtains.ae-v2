import { Mail, MessageSquare } from "lucide-react";
import { QuoteForm } from "@/components/public/QuoteForm";

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-[#D8C9BC]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5A0E12]">
            Contact Flora
          </span>

          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-[#1E1B18] sm:text-6xl">
            Tell us about
            <br />
            your space.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[#6B625A]">
            Share a few details about your project and
            requirements. Our team can then understand what
            you need and follow up with you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <aside>
          <h2 className="font-serif text-3xl text-[#1E1B18]">
            Start a conversation.
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#6B625A]">
            Whether you are planning a residential
            interior or a commercial project, send us your
            requirements and we&apos;ll take it from there.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#5A0E12]">
                <Mail size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                  Email
                </p>

                <a
                  href="mailto:sayedflora1@gmail.com"
                  className="mt-1 block text-sm font-medium text-[#1E1B18] hover:text-[#5A0E12]"
                >
                  sayedflora1@gmail.com
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#5A0E12]">
                <MessageSquare size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B625A]">
                  Enquiries
                </p>

                <p className="mt-1 text-sm text-[#6B625A]">
                  Tell us what you are looking for and
                  where your project is located.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <QuoteForm />
      </section>
    </>
  );
}