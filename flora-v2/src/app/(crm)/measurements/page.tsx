import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function MeasurementsPage() {
  const sheets = await db.measurementSheet.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      siteVisit: {
        include: {
          enquiry: { include: { contact: true } },
          project: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Measurements"
        description="All measurement sheets recorded from site visits."
        actions={
          <Button variant="secondary" href="/site-visits">
            Go to Site Visits
          </Button>
        }
      />

      <Card
        title="Measurement sheets"
        description={`${sheets.length} record${sheets.length === 1 ? "" : "s"} shown`}
        padded={false}
      >
        {sheets.length === 0 ? (
          <EmptyState
            title="No measurements yet"
            hint="Measurements are created from a site visit via the Site Visit manager."
            action={<Button href="/site-visits">Open Site Visits</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-flora-cream text-left text-[10px] uppercase tracking-wider text-flora-muted">
                  <th className="px-5 py-3 font-medium">Room / Opening</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Visit</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((m) => (
                  <tr key={m.id} className="border-t border-flora-border/50 hover:bg-flora-background">
                    <td className="px-5 py-3 font-medium text-flora-foreground">
                      {m.roomName}
                      <span className="block text-xs font-normal text-flora-muted">
                        {m.openingType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-flora-muted">
                      {m.width} × {m.height} {m.unit}
                    </td>
                    <td className="px-5 py-3 text-flora-muted">{m.quantity}</td>
                    <td className="px-5 py-3 text-flora-muted">
                      {m.siteVisit.enquiry.contact.name}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href="/site-visits"
                        className="text-xs font-medium text-flora-primary hover:underline"
                      >
                        View visit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
