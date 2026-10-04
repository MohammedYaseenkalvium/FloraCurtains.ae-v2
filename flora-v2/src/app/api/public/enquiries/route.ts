import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { parseBudgetAed, publicEnquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // Basic abuse protection for the unauthenticated endpoint (Phase 3).
    // In-memory limiter: 10 submissions / 15 min per IP+phone bucket.
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    let rawBody: unknown = null;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid enquiry data." }, { status: 400 });
    }
    const phoneHint =
      typeof rawBody === "object" && rawBody !== null && "phone" in rawBody
        ? String((rawBody as Record<string, unknown>).phone ?? "")
        : "";
    const limited = rateLimit(`public-enquiry:${forwarded}:${phoneHint}`, 10, 15 * 60 * 1000);
    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }
    const body = rawBody;

    const parsed = publicEnquirySchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid enquiry data.",
          fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const data = parsed.data;

    /*
     * Contact + enquiry + activity log are written atomically so a
     * public submission can never leave a half-created record.
     */
    const enquiry = await db.$transaction(async (tx) => {
      /*
       * Find an existing contact by email.
       */
      let contact = await tx.contact.findFirst({
        where: {
          email: data.email,
        },
      });

      /*
       * If no email match exists, try the phone number.
       */
      if (!contact) {
        contact = await tx.contact.findFirst({
          where: {
            phone: data.phone,
          },
        });
      }

      /*
       * Create a new contact if this is a new customer.
       * A concurrent submit with the same new phone/email can win the
       * race between findFirst and create (P2002 on the unique phone):
       * re-read once and continue instead of failing the enquiry.
       */
      if (!contact) {
        try {
          contact = await tx.contact.create({
            data: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              source: "WEBSITE",
            },
          });
        } catch (error) {
          const code =
            typeof error === "object" && error !== null && "code" in error
              ? String((error as { code?: unknown }).code ?? "")
              : "";
          if (code !== "P2002") throw error;
          contact =
            (await tx.contact.findFirst({
              where: {
                email: data.email,
              },
            })) ??
            (await tx.contact.findFirst({
              where: {
                phone: data.phone,
              },
            }));
          if (!contact) throw error;
        }
      } else {
        /*
         * Fill blank fields only — never overwrite stored contact data.
         *
         * This endpoint is anonymous, so a submitter who knows (or guesses)
         * a phone number or email could otherwise rewrite a customer's name,
         * email and phone. Corrections are made by staff in the CRM.
         */
        const contactUpdates: {
          name?: string;
          email?: string;
          phone?: string;
        } = {};

        if (!contact.name && data.name) {
          contactUpdates.name = data.name;
        }

        if (!contact.email && data.email) {
          contactUpdates.email = data.email;
        }

        if (!contact.phone && data.phone) {
          contactUpdates.phone = data.phone;
        }

        if (Object.keys(contactUpdates).length > 0) {
          contact = await tx.contact.update({
            where: {
              id: contact.id,
            },
            data: contactUpdates,
          });
        }
      }

      /*
       * Budget is free text on the website. A parseable AED figure is
       * stored on desiredBudget so the CRM can show and report it; the
       * raw string always stays in remarks/meta regardless.
       */
      const enquiryRemarks = [
        data.budget ? `Budget: ${data.budget}` : null,
        data.notes || null,
      ]
        .filter(Boolean)
        .join("\n\n");

      /*
       * Create the CRM enquiry.
       */
      const created = await tx.enquiry.create({
        data: {
          contactId: contact.id,
          customerType: data.customerType,
          serviceWanted: data.serviceWanted,
          projectName: data.projectName || null,
          siteAddress: data.siteAddress || null,
          remarks: enquiryRemarks || null,
          desiredBudget: parseBudgetAed(data.budget),
          status: "NEW",
        },
      });

      /*
       * Record the public enquiry in the CRM activity log.
       */
      await tx.activityLog.create({
        data: {
          userName: "Public Website",
          action: "PUBLIC_ENQUIRY_CREATED",
          entityType: "ENQUIRY",
          entityId: created.id,
          summary: `New public enquiry received from ${contact.name}.`,
          meta: {
            source: "public_website",
            customerType: data.customerType,
            serviceWanted: data.serviceWanted,
            email: contact.email,
            phone: contact.phone,
            budget: data.budget || null,
          },
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        enquiryId: enquiry.id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Public enquiry error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to submit your enquiry. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}