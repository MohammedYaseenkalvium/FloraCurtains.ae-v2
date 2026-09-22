import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

import type {
  Contact,
  Company,
  Prisma,
} from "@prisma/client";

import type { QuotationLineItem } from "@/types";

import fs from "fs";
import path from "path";

/* =========================================================
   FLORA BRAND TOKENS
========================================================= */

const burgundy = "#5A0E12";
const burgundyDark = "#3F080B";
const text = "#1E1B18";
const muted = "#6B625A";
const border = "#D8C9BC";
const surface = "#F8F5F2";
const white = "#FFFFFF";
const green = "#0F6E56";
const softGreen = "#EAF4F0";

/* =========================================================
   LOGO
=========================================================

   Existing logo:

   public/images/flora-logo.png

   We load it as Base64 so @react-pdf/renderer can render
   the local PNG reliably.
========================================================= */

const logoPath = path.join(
  process.cwd(),
  "public",
  "images",
  "flora-logo.png"
);

// Phase 6: never crash the PDF route if the logo asset is missing
// (e.g. standalone Docker deploy without public/images). Fall back to
// text-only header.
let logoSrc: string | null = null;
try {
  if (fs.existsSync(logoPath)) {
    logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  }
} catch {
  logoSrc = null;
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: text,
    backgroundColor: white,

    paddingTop: 38,
    paddingBottom: 62,
    paddingHorizontal: 48,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",

    paddingBottom: 13,

    borderBottom: `1 solid ${border}`,
  },

  brandBlock: {
    width: "58%",
  },

  logo: {
    width: 145,
    height: 48,
    objectFit: "contain",

    marginBottom: 3,
  },

  companyInfo: {
    marginTop: 3,

    fontSize: 7.5,
    lineHeight: 1.45,

    color: muted,
  },

  quoteBlock: {
    width: "38%",

    alignItems: "flex-end",

    paddingTop: 3,
  },

  quotationLabel: {
    fontSize: 7.5,

    color: muted,

    letterSpacing: 2.2,

    textTransform: "uppercase",
  },

  quoteNumber: {
    marginTop: 4,

    fontSize: 18,

    fontWeight: 700,

    color: burgundy,

    textAlign: "right",
  },

  quoteMeta: {
    marginTop: 5,

    fontSize: 7.5,

    lineHeight: 1.5,

    color: muted,

    textAlign: "right",
  },

  /* =======================================================
     CUSTOMER INFORMATION
  ======================================================= */

  infoGrid: {
    flexDirection: "row",

    marginTop: 15,
    marginBottom: 17,

    gap: 12,
  },

  infoCard: {
    flex: 1,

    minHeight: 86,

    padding: 12,

    backgroundColor: surface,

    border: `1 solid ${border}`,

    borderRadius: 5,
  },

  infoCardRight: {
    flex: 1,

    minHeight: 86,

    padding: 12,

    backgroundColor: white,

    border: `1 solid ${border}`,

    borderRadius: 5,
  },

  sectionLabel: {
    marginBottom: 7,

    fontSize: 6.8,

    color: muted,

    letterSpacing: 1.7,

    textTransform: "uppercase",
  },

  customerName: {
    marginBottom: 5,

    fontSize: 11,

    fontWeight: 700,

    color: burgundyDark,
  },

  infoValue: {
    fontSize: 8.5,

    lineHeight: 1.45,

    color: text,
  },

  infoMuted: {
    fontSize: 8,

    lineHeight: 1.45,

    color: muted,
  },

  /* =======================================================
     SERVICE
  ======================================================= */

  serviceStrip: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 43,

    paddingHorizontal: 12,

    marginBottom: 18,

    backgroundColor: burgundy,

    borderRadius: 5,
  },

  serviceLabel: {
    width: 75,

    fontSize: 6.8,

    color: "#EAD9D5",

    letterSpacing: 1.6,

    textTransform: "uppercase",
  },

  serviceValue: {
    flex: 1,

    fontSize: 9.5,

    fontWeight: 700,

    color: white,
  },

  projectValue: {
    width: "38%",

    fontSize: 8,

    color: "#F5EDEB",

    textAlign: "right",
  },

  /* =======================================================
     TABLE
  ======================================================= */

  table: {
    width: "100%",

    marginTop: 1,
  },

  tableHeader: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 32,

    paddingVertical: 7,
    paddingHorizontal: 9,

    backgroundColor: surface,

    borderTop: `1 solid ${border}`,
    borderBottom: `1 solid ${border}`,
  },

  tableRow: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 39,

    paddingVertical: 8,
    paddingHorizontal: 9,

    borderBottom: "1 solid #EFE7DF",
  },

  descriptionColumn: {
    flex: 4.5,
  },

  quantityColumn: {
    flex: 0.8,

    textAlign: "right",
  },

  unitColumn: {
    flex: 1.3,

    textAlign: "right",
  },

  discountColumn: {
    flex: 0.9,

    textAlign: "right",
  },

  totalColumn: {
    flex: 1.5,

    textAlign: "right",
  },

  headerText: {
    fontSize: 7,

    fontWeight: 700,

    color: muted,

    letterSpacing: 0.7,

    textTransform: "uppercase",
  },

  descriptionText: {
    fontSize: 8.5,

    color: text,
  },

  unitText: {
    marginTop: 2,

    fontSize: 6.8,

    color: muted,
  },

  numberText: {
    fontSize: 8.5,

    color: text,
  },

  totalText: {
    fontSize: 8.5,

    fontWeight: 700,

    color: text,
  },

  /* =======================================================
     TOTALS
  ======================================================= */

  totalsArea: {
    flexDirection: "row",

    justifyContent: "flex-end",

    marginTop: 13,
  },

  totalsBox: {
    width: 230,
  },

  totalLine: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 3.5,
  },

  totalLabel: {
    fontSize: 8.5,

    color: muted,
  },

  totalValue: {
    fontSize: 8.5,

    color: text,

    textAlign: "right",
  },

  grandTotalLine: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 6,

    paddingTop: 9,

    borderTop: `1.2 solid ${burgundy}`,
  },

  grandTotalLabel: {
    fontSize: 10,

    fontWeight: 700,

    color: burgundy,

    letterSpacing: 0.8,
  },

  grandTotalValue: {
    fontSize: 14,

    fontWeight: 700,

    color: burgundy,

    textAlign: "right",
  },

  /* =======================================================
     NOTES
  ======================================================= */

  notesSection: {
    marginTop: 21,

    padding: 12,

    backgroundColor: surface,

    border: `1 solid ${border}`,

    borderRadius: 5,
  },

  notesLabel: {
    marginBottom: 6,

    fontSize: 6.8,

    color: muted,

    letterSpacing: 1.6,

    textTransform: "uppercase",
  },

  notesText: {
    fontSize: 8,

    lineHeight: 1.5,

    color: text,
  },

  /* =======================================================
     STATUS
  ======================================================= */

  statusBox: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 17,

    paddingVertical: 10,

    paddingHorizontal: 12,

    backgroundColor: white,

    border: `1 solid ${border}`,

    borderRadius: 5,
  },

  statusLabel: {
    fontSize: 7,

    color: muted,

    letterSpacing: 1.3,

    textTransform: "uppercase",
  },

  statusPill: {
    paddingVertical: 4,

    paddingHorizontal: 9,

    backgroundColor: softGreen,

    borderRadius: 10,
  },

  statusValue: {
    fontSize: 7.5,

    fontWeight: 700,

    color: green,

    letterSpacing: 0.5,

    textTransform: "uppercase",
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    position: "absolute",

    left: 48,
    right: 48,

    bottom: 21,

    paddingTop: 8,

    borderTop: `1 solid ${border}`,
  },

  footerBrand: {
    marginBottom: 3,

    fontSize: 7,

    fontWeight: 700,

    color: burgundy,

    textAlign: "center",
  },

  footerText: {
    fontSize: 6.7,

    lineHeight: 1.45,

    color: muted,

    textAlign: "center",
  },
});

/* =========================================================
   PRISMA TYPE
========================================================= */

type Props = {
  quotation: Prisma.QuotationGetPayload<{
    include: {
      enquiry: {
        include: {
          contact: true;
          company: true;
        };
      };
    };
  }>;
};

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(value: number) {
  return `AED ${Number(value).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(
  date: Date | null | undefined
) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getBilledName(
  quotation: Props["quotation"],
  company: Company | null,
  contact: Contact
) {
  return (
    quotation.billedToName ??
    company?.tradeName ??
    contact.name
  );
}

/* =========================================================
   QUOTATION PDF
========================================================= */

export function QuotationPDF({
  quotation,
}: Props) {
  const items =
    quotation.items as QuotationLineItem[];

  const {
    contact,
    company,
  } = quotation.enquiry;

  const billedName =
    getBilledName(
      quotation,
      company,
      contact
    );

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
        wrap
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image renders into PDF, not HTML; no alt concept.
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <Text style={styles.companyInfo}>Flora Curtains LLC</Text>
            )}

            <Text style={styles.companyInfo}>
              Flora Curtains LLC{"\n"}
              Murur Road, Opp. Mubadala Tower{"\n"}
              Abu Dhabi, UAE · P.O Box 25766{"\n"}
              sayedflora1@gmail.com
            </Text>
          </View>

          <View style={styles.quoteBlock}>
            <Text
              style={styles.quotationLabel}
            >
              Quotation
            </Text>

            <Text
              style={styles.quoteNumber}
            >
              {quotation.quoteNumber}
            </Text>

            <Text
              style={styles.quoteMeta}
            >
              Date:{" "}
              {formatDate(
                quotation.createdAt
              )}

              {"\n"}

              {quotation.validUntil
                ? `Valid Until: ${formatDate(
                    quotation.validUntil
                  )}`
                : ""}
            </Text>
          </View>
        </View>

        {/* =================================================
            CUSTOMER / BILLING
        ================================================= */}

        <View style={styles.infoGrid}>
          {/* BILLING */}
          <View style={styles.infoCard}>
            <Text
              style={styles.sectionLabel}
            >
              Billed To
            </Text>

            <Text
              style={styles.customerName}
            >
              {billedName}
            </Text>

            {quotation.billedToTrn ??
            company?.trn ? (
              <Text
                style={styles.infoMuted}
              >
                TRN:{" "}
                {quotation.billedToTrn ??
                  company?.trn}
              </Text>
            ) : null}

            {quotation.billedToAddr ? (
              <Text
                style={styles.infoMuted}
              >
                {quotation.billedToAddr}
              </Text>
            ) : null}

            {contact.phone ? (
              <Text
                style={styles.infoMuted}
              >
                {contact.phone}
              </Text>
            ) : null}

            {contact.email ? (
              <Text
                style={styles.infoMuted}
              >
                {contact.email}
              </Text>
            ) : null}
          </View>

          {/* CUSTOMER */}
          <View style={styles.infoCardRight}>
            <Text
              style={styles.sectionLabel}
            >
              Customer
            </Text>

            <Text
              style={styles.customerName}
            >
              {contact.name}
            </Text>

            <Text
              style={styles.infoValue}
            >
              {company
                ? "Company / Firm"
                : "Individual"}
            </Text>

            {company?.tradeName ? (
              <Text
                style={styles.infoMuted}
              >
                {company.tradeName}
              </Text>
            ) : null}

            {quotation.enquiry
              .siteAddress ? (
              <Text
                style={styles.infoMuted}
              >
                Site:{" "}
                {quotation.enquiry.siteAddress}
              </Text>
            ) : null}
          </View>
        </View>

        {/* =================================================
            SERVICE
        ================================================= */}

        <View
          style={styles.serviceStrip}
        >
          <Text
            style={styles.serviceLabel}
          >
            Service
          </Text>

          <Text
            style={styles.serviceValue}
          >
            {quotation.enquiry.serviceWanted}
          </Text>

          {quotation.enquiry.projectName ? (
            <Text
              style={styles.projectValue}
            >
              {quotation.enquiry.projectName}
            </Text>
          ) : null}
        </View>

        {/* =================================================
            ITEMS TABLE
        ================================================= */}

        <View style={styles.table}>
          {/* TABLE HEADER */}
          <View
            style={styles.tableHeader}
          >
            <Text
              style={[
                styles.descriptionColumn,
                styles.headerText,
              ]}
            >
              Description
            </Text>

            <Text
              style={[
                styles.quantityColumn,
                styles.headerText,
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                styles.unitColumn,
                styles.headerText,
              ]}
            >
              Unit Price
            </Text>

            <Text
              style={[
                styles.discountColumn,
                styles.headerText,
              ]}
            >
              Disc.
            </Text>

            <Text
              style={[
                styles.totalColumn,
                styles.headerText,
              ]}
            >
              Total
            </Text>
          </View>

          {/* TABLE ROWS */}
          {items.map(
            (item, index) => {
              const quantity =
                Number(item.qty);

              const unitPrice =
                Number(
                  item.unitPrice
                );

              const discount =
                Number(
                  item.discount || 0
                );

              const lineTotal =
                quantity *
                unitPrice *
                (1 -
                  discount / 100);

              return (
                <View
                  key={`${item.description}-${index}`}
                  style={styles.tableRow}
                  wrap={false}
                >
                  <View
                    style={
                      styles.descriptionColumn
                    }
                  >
                    <Text
                      style={
                        styles.descriptionText
                      }
                    >
                      {item.description}
                    </Text>

                    <Text
                      style={
                        styles.unitText
                      }
                    >
                      {item.unit}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.quantityColumn,
                      styles.numberText,
                    ]}
                  >
                    {quantity}
                  </Text>

                  <Text
                    style={[
                      styles.unitColumn,
                      styles.numberText,
                    ]}
                  >
                    {formatMoney(
                      unitPrice
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.discountColumn,
                      styles.numberText,
                    ]}
                  >
                    {discount > 0
                      ? `${discount}%`
                      : "—"}
                  </Text>

                  <Text
                    style={[
                      styles.totalColumn,
                      styles.totalText,
                    ]}
                  >
                    {formatMoney(
                      lineTotal
                    )}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        {/* =================================================
            TOTALS
        ================================================= */}

        <View
          style={styles.totalsArea}
        >
          <View
            style={styles.totalsBox}
          >
            <View
              style={styles.totalLine}
            >
              <Text
                style={styles.totalLabel}
              >
                Subtotal
              </Text>

              <Text
                style={styles.totalValue}
              >
                {formatMoney(
                  quotation.subtotal
                )}
              </Text>
            </View>

            {quotation.vatRate > 0 && (
              <View
                style={styles.totalLine}
              >
                <Text
                  style={styles.totalLabel}
                >
                  VAT ({quotation.vatRate}%)
                </Text>

                <Text
                  style={styles.totalValue}
                >
                  {formatMoney(
                    quotation.vatAmount
                  )}
                </Text>
              </View>
            )}

            <View
              style={
                styles.grandTotalLine
              }
            >
              <Text
                style={
                  styles.grandTotalLabel
                }
              >
                TOTAL
              </Text>

              <Text
                style={
                  styles.grandTotalValue
                }
              >
                {formatMoney(
                  quotation.totalAmount
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            NOTES
        ================================================= */}

        {quotation.notes ? (
          <View
            style={
              styles.notesSection
            }
          >
            <Text
              style={
                styles.notesLabel
              }
            >
              Notes
            </Text>

            <Text
              style={
                styles.notesText
              }
            >
              {quotation.notes}
            </Text>
          </View>
        ) : null}

        {/* =================================================
            STATUS
        ================================================= */}

        <View
          style={styles.statusBox}
        >
          <Text
            style={styles.statusLabel}
          >
            Quotation Status
          </Text>

          <View
            style={styles.statusPill}
          >
            <Text
              style={styles.statusValue}
            >
              {quotation.status}
            </Text>
          </View>
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View
          style={styles.footer}
          fixed
        >
          <Text
            style={styles.footerBrand}
          >
            FLORA CURTAINS LLC
          </Text>

          <Text
            style={styles.footerText}
          >
            Murur Road, Opp. Mubadala Tower,
            Abu Dhabi, UAE · P.O Box 25766
            {"\n"}
            sayedflora1@gmail.com
            {" · "}
            www.floracurtains.com
            {"\n"}
            This is a computer-generated
            document.
          </Text>
        </View>
      </Page>
    </Document>
  );
}