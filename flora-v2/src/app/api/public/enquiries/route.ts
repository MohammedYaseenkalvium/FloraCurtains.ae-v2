import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address."),

  phone: z
    .string()
    .trim()
    .min(5, "Phone number is required.")
    .max(30, "Phone number is too long."),

  customerType: z
    .enum(["B2C", "B2B"])
    .default("B2C"),

  serviceWanted: z
    .string()
    .trim()
    .min(2, "Please select a service.")
    .max(100, "Service name is too long."),

  projectName: z
    .string()
    .trim()
    .max(150, "Project name is too long.")
    .optional()
    .or(z.literal("")),

  siteAddress: z
    .string()
    .trim()
    .max(1000, "Site address is too long.")
    .optional()
    .or(z.literal("")),

  budget: z
    .string()
    .trim()
    .max(100, "Budget is too long.")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(3000, "Message is too long.")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid enquiry data.",
        },
        {
          status: 400,
        }
      );
    }

    const data = parsed.data;

    /*
     * Find an existing contact by email.
     */
    let contact = await db.contact.findFirst({
      where: {
        email: data.email,
      },
    });

    /*
     * If no email match exists, try the phone number.
     */
    if (!contact) {
      contact = await db.contact.findFirst({
        where: {
          phone: data.phone,
        },
      });
    }

    /*
     * Create a new contact if this is a new customer.
     */
    if (!contact) {
      contact = await db.contact.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
        },
      });
    } else {
      /*
       * Update contact details when the public enquiry
       * contains newer information.
       */
      const contactUpdates: {
        name?: string;
        email?: string;
        phone?: string;
      } = {};

      if (
        data.name &&
        data.name !== contact.name
      ) {
        contactUpdates.name = data.name;
      }

      if (
        data.email &&
        data.email !== contact.email
      ) {
        contactUpdates.email = data.email;
      }

      if (
        data.phone &&
        data.phone !== contact.phone
      ) {
        contactUpdates.phone = data.phone;
      }

      if (
        Object.keys(contactUpdates).length > 0
      ) {
        contact = await db.contact.update({
          where: {
            id: contact.id,
          },
          data: contactUpdates,
        });
      }
    }

    /*
     * Enquiry does not have a dedicated budget field
     * in the current Prisma schema.
     *
     * Therefore budget is preserved inside remarks.
     */
    const enquiryRemarks = [
      data.budget
        ? `Budget: ${data.budget}`
        : null,

      data.notes || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    /*
     * Create the CRM enquiry.
     */
    const enquiry = await db.enquiry.create({
      data: {
        contactId: contact.id,

        customerType:
          data.customerType,

        serviceWanted:
          data.serviceWanted,

        projectName:
          data.projectName || null,

        siteAddress:
          data.siteAddress || null,

        remarks:
          enquiryRemarks || null,

        status: "NEW",
      },
    });

    /*
     * Record the public enquiry in the CRM activity log.
     */
    await db.activityLog.create({
      data: {
        userName: "Public Website",

        action:
          "PUBLIC_ENQUIRY_CREATED",

        entityType: "ENQUIRY",

        entityId: enquiry.id,

        summary:
          `New public enquiry received from ${contact.name}.`,

        meta: {
          source: "public_website",

          customerType:
            data.customerType,

          serviceWanted:
            data.serviceWanted,

          email:
            contact.email,

          phone:
            contact.phone,

          budget:
            data.budget || null,
        },
      },
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