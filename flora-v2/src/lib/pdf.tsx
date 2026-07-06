import {
  Document, Page, Text, View, StyleSheet, Image
} from "@react-pdf/renderer";
import type { Quotation, Contact, Company } from "@prisma/client";
import type { QuotationLineItem } from "@/types";
import fs from "fs";
import path from "path";

// --- LAZY LOGO LOADER ---
let logoSrc: string | undefined;

function getLogoSrc(): string {
  if (!logoSrc) {
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    const logoBase64 = fs.readFileSync(logoPath).toString("base64");
    logoSrc = `data:image/png;base64,${logoBase64}`;
  }
  return logoSrc;
}

const burgundy = "#5A0E12";

const s = StyleSheet.create({
  page:       { fontFamily: "Helvetica", fontSize: 9, color: "#1A1A1A", padding: "40 48" },
  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  logoBox:    { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImg:    { width: 100, height: 30 },
  logoText:   { fontSize: 22, fontWeight: 700, color: burgundy, letterSpacing: 2 },
  logoSub:    { fontSize: 7, color: "#6B625A", letterSpacing: 3, marginTop: 2 },
  quoteNo:    { fontSize: 18, fontWeight: 700, color: burgundy, textAlign: "right" },
  section:    { marginBottom: 16 },
  label:      { fontSize: 7, color: "#6B625A", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 },
  value:      { fontSize: 9 },
  table:      { marginTop: 16 },
  tHead:      { flexDirection: "row", backgroundColor: "#F8F5F2", padding: "6 8", borderRadius: 4 },
  tRow:       { flexDirection: "row", padding: "8 8", borderBottom: "1 solid #EFE7DF" },
  col_desc:   { flex: 4 },
  col_num:    { flex: 1, textAlign: "right" },
  total_row:  { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  total_label:{ fontSize: 9, color: "#6B625A", marginRight: 40, width: 100, textAlign: "right" },
  total_value:{ width: 80, textAlign: "right", fontSize: 9 },
  grand:      { fontWeight: 700, fontSize: 11, color: burgundy },
  footer:     { position: "absolute", bottom: 20, left: 48, right: 48, fontSize: 7, color: "#6B625A", textAlign: "center" },
  divider:    { borderTop: "1 solid #D8C9BC", marginVertical: 12 },
  watermark:  { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03 },
});

type Props = {
  quotation: Quotation & { enquiry: { contact: Contact; company: Company | null } };
};

export function QuotationPDF({ quotation }: Props) {
  const items = quotation.items as QuotationLineItem[];
  const { contact, company } = quotation.enquiry;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.logoBox}>
            {/* @react-pdf Image is not an HTML img and has no alt prop */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={getLogoSrc()} style={s.logoImg} />
            <View>
              <Text style={s.logoText}>FLORA</Text>
              <Text style={s.logoSub}>Curtains</Text>
              <Text style={{ fontSize: 7, color: "#6B625A", marginTop: 6 }}>Abu Dhabi, UAE · www.floracurtains.com</Text>
            </View>
          </View>
          <View>
            <Text style={s.quoteNo}>{quotation.quoteNumber}</Text>
            <Text style={{ fontSize: 7, color: "#6B625A", textAlign: "right", marginTop: 4 }}>
              Date: {new Date(quotation.createdAt).toLocaleDateString("en-AE")}
            </Text>
            {quotation.validUntil && (
              <Text style={{ fontSize: 7, color: "#6B625A", textAlign: "right" }}>
                Valid Until: {new Date(quotation.validUntil).toLocaleDateString("en-AE")}
              </Text>
            )}
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.section}>
          <Text style={s.label}>Billed To</Text>
          <Text style={[s.value, { fontWeight: 700 }]}>
            {quotation.billedToName ?? (company ? company.tradeName : contact.name)}
          </Text>
          {(quotation.billedToTrn ?? company?.trn) && (
            <Text style={s.value}>TRN: {quotation.billedToTrn ?? company?.trn}</Text>
          )}
          {quotation.billedToAddr && <Text style={s.value}>{quotation.billedToAddr}</Text>}
          <Text style={s.value}>{contact.phone}</Text>
        </View>

        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.col_desc, { fontWeight: 700, fontSize: 8 }]}>Description</Text>
            <Text style={[s.col_num, { fontWeight: 700, fontSize: 8 }]}>Qty</Text>
            <Text style={[s.col_num, { fontWeight: 700, fontSize: 8 }]}>Unit Price</Text>
            <Text style={[s.col_num, { fontWeight: 700, fontSize: 8 }]}>Total</Text>
          </View>
          {items.map((item, i) => {
            const lineTotal = item.qty * item.unitPrice * (1 - item.discount / 100);
            return (
              <View key={i} style={s.tRow}>
                <Text style={s.col_desc}>{item.description} ({item.unit})</Text>
                <Text style={s.col_num}>{item.qty}</Text>
                <Text style={s.col_num}>AED {Number(item.unitPrice).toLocaleString()}</Text>
                <Text style={s.col_num}>AED {lineTotal.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 12 }}>
          {[
            { label: "Subtotal", value: `AED ${Number(quotation.subtotal).toLocaleString("en-AE", { minimumFractionDigits: 2 })}` },
            { label: `VAT (${quotation.vatRate}%)`, value: `AED ${Number(quotation.vatAmount).toLocaleString("en-AE", { minimumFractionDigits: 2 })}` },
          ].map(({ label, value }) => (
            <View style={s.total_row} key={label}>
              <Text style={s.total_label}>{label}</Text>
              <Text style={s.total_value}>{value}</Text>
            </View>
          ))}
          <View style={[s.divider, { marginHorizontal: 0 }]} />
          <View style={s.total_row}>
            <Text style={[s.total_label, s.grand]}>TOTAL</Text>
            <Text style={[s.total_value, s.grand]}>
              AED {Number(quotation.totalAmount).toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {quotation.notes && (
          <View style={[s.section, { marginTop: 20 }]}>
            <Text style={s.label}>Notes</Text>
            <Text style={s.value}>{quotation.notes}</Text>
          </View>
        )}

        <Text style={s.footer}>
          Flora Curtains LLC · Murur Road, Opp. Mubadala Tower, Abu Dhabi, UAE · P.O Box 25766
          · Phone: +971 2 586 4545 · Mobile: +971 50 511 9982 / +971 50 811 6299
          · sayedflora1@gmail.com · info@floracurtains.com
          · This is a computer-generated document
        </Text>
      </Page>
    </Document>
  );
}