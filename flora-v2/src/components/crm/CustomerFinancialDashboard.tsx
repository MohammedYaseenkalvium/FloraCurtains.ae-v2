// src/components/crm/CustomerFinancialDashboard.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type { CustomerFinancialSummary } from "@/lib/customer-financial";
import {
  TrendingUp, TrendingDown, Wallet, FileText, FolderOpen, 
  CreditCard, Receipt, Phone, Mail, Building, AlertCircle,
  CheckCircle2, Clock, ChevronDown, ChevronUp, Download, Plus,
  LucideIcon
} from "lucide-react";

interface Props {
  summary: CustomerFinancialSummary;
}

const statusColors: Record<string, string> = {
  NEW: "#8B8178", CONTACTED: "#185FA5", VISIT_SCHEDULED: "#854D0E",
  QUOTED: "#0F6E56", NEGOTIATING: "#7F77DD", WON: "#166534", LOST: "#991B1B",
  DRAFT: "#8B8178", SENT: "#185FA5", APPROVED: "#0F6E56",
  REJECTED: "#991B1B", REVISED: "#854D0E",
  NOT_STARTED: "#8B8178", IN_PROGRESS: "#185FA5", INSTALLATION: "#854D0E",
  SNAGGING: "#7F77DD", COMPLETED: "#166534", ON_HOLD: "#991B1B",
};

const methodIcons: Record<string, LucideIcon> = {
  CASH: Wallet,
  BANK_TRANSFER: Building,
  CHEQUE: Receipt,
  CARD: CreditCard,
};

export function CustomerFinancialDashboard({ summary }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "projects" | "quotations" | "ledger">("overview");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

  const {
    customerName, customerPhone, customerEmail, companyName, companyType,
    lifetimeRevenue, totalPaid, outstanding, totalQuoted, totalContractValue,
    enquiryCount, quotationCount, projectCount, paymentCount, activeProjectCount,
    enquiries, quotations, projects, payments, ledger,
  } = summary;

  const paidPercentage = lifetimeRevenue > 0 ? (totalPaid / lifetimeRevenue) * 100 : 0;
  const outstandingPercentage = lifetimeRevenue > 0 ? (outstanding / lifetimeRevenue) * 100 : 0;

  const kpiCards = [
    {
      label: "Lifetime Revenue",
      value: `AED ${lifetimeRevenue.toLocaleString("en-AE", { minimumFractionDigits: 0 })}`,
      color: "#5A0E12",
      icon: TrendingUp,
      subtext: `${quotationCount} quotes · ${projectCount} projects`,
    },
    {
      label: "Total Paid",
      value: `AED ${totalPaid.toLocaleString("en-AE", { minimumFractionDigits: 0 })}`,
      color: "#0F6E56",
      icon: CheckCircle2,
      subtext: `${paymentCount} payments received`,
    },
    {
      label: "Outstanding",
      value: `AED ${outstanding.toLocaleString("en-AE", { minimumFractionDigits: 0 })}`,
      color: outstanding > 0 ? "#991B1B" : "#0F6E56",
      icon: outstanding > 0 ? AlertCircle : CheckCircle2,
      subtext: outstanding > 0 ? "Payment due" : "All clear",
    },
    {
      label: "Active Projects",
      value: activeProjectCount,
      color: "#185FA5",
      icon: FolderOpen,
      subtext: `${projectCount} total projects`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{customerName}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#6B625A]">
            <span className="flex items-center gap-1">
              <Phone size={14} /> {customerPhone}
            </span>
            {customerEmail && (
              <span className="flex items-center gap-1">
                <Mail size={14} /> {customerEmail}
              </span>
            )}
            {companyName && (
              <span className="flex items-center gap-1">
                <Building size={14} /> {companyName}
                {companyType && <span className="text-xs text-[#8B8178]">({companyType.replace(/_/g, " ")})</span>}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-[#EFE7DF] border border-[#D8C9BC] rounded-lg px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#D8C9BC] transition-colors">
            <Receipt size={14} /> Statement PDF
          </button>
          <button className="flex items-center gap-2 bg-[#5A0E12] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#7A1E22] transition-colors">
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, color, icon: Icon, subtext }) => (
          <div key={label} className="bg-white border border-[#D8C9BC] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} style={{ color }} />
              <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">{label}</span>
            </div>
            <div className="text-2xl font-extrabold tracking-tight" style={{ color }}>{value}</div>
            <div className="text-xs text-[#6B625A] mt-1">{subtext}</div>
            
            {/* Progress bar for paid vs outstanding */}
            {label === "Lifetime Revenue" && (
              <div className="mt-3">
                <div className="h-1.5 bg-[#EFE7DF] rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#0F6E56] rounded-full" style={{ width: `${paidPercentage}%` }} />
                  <div className="h-full bg-[#991B1B] rounded-full" style={{ width: `${outstandingPercentage}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#6B625A] mt-1">
                  <span className="text-[#0F6E56]">{paidPercentage.toFixed(0)}% paid</span>
                  <span className="text-[#991B1B]">{outstandingPercentage.toFixed(0)}% due</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Progress */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm text-[#5A0E12]">Payment Progress</h3>
          <span className="text-sm font-medium text-[#6B625A]">
            {paidPercentage.toFixed(1)}% collected
          </span>
        </div>
        <div className="h-3 bg-[#EFE7DF] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#5A0E12] rounded-full transition-all"
            style={{ width: `${Math.min(paidPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#6B625A]">
          <span>AED 0</span>
          <span>AED {lifetimeRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#D8C9BC]">
        <div className="flex gap-6">
          {[
            { id: "overview" as const, label: "Overview", count: null },
            { id: "payments" as const, label: "Payments", count: paymentCount },
            { id: "projects" as const, label: "Projects", count: projectCount },
            { id: "quotations" as const, label: "Quotations", count: quotationCount },
            { id: "ledger" as const, label: "Running Balance", count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? "text-[#5A0E12] border-b-2 border-[#5A0E12]" 
                  : "text-[#6B625A] hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="ml-1.5 text-[10px] bg-[#EFE7DF] px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <OverviewTab 
            enquiries={enquiries} 
            recentPayments={payments.slice(0, 5)}
            projects={projects}
            quotations={quotations}
            totalQuoted={totalQuoted}
            totalContractValue={totalContractValue}
            totalPaid={totalPaid}
            outstanding={outstanding}
          />
        )}
        {activeTab === "payments" && <PaymentsTab payments={payments} />}
        {activeTab === "projects" && (
          <ProjectsTab 
            projects={projects} 
            expandedId={expandedProject}
            onToggle={setExpandedProject}
          />
        )}
        {activeTab === "quotations" && (
          <QuotationsTab 
            quotations={quotations}
            expandedId={expandedQuote}
            onToggle={setExpandedQuote}
          />
        )}
        {activeTab === "ledger" && <LedgerTab ledger={ledger} />}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OverviewTab({ 
  enquiries, 
  recentPayments, 
  projects, 
  quotations,
  totalQuoted,
  totalContractValue,
  totalPaid,
  outstanding
}: {
  enquiries: CustomerFinancialSummary["enquiries"];
  recentPayments: CustomerFinancialSummary["payments"];
  projects: CustomerFinancialSummary["projects"];
  quotations: CustomerFinancialSummary["quotations"];
  totalQuoted: number;
  totalContractValue: number;
  totalPaid: number;
  outstanding: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Recent Payments</h3>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-[#6B625A]">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentPayments.map(p => {
              const Icon = methodIcons[p.method] ?? CreditCard;
              return (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#EFE7DF] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F8F5F2] rounded-lg flex items-center justify-center">
                      <Icon size={14} className="text-[#5A0E12]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">AED {p.amount.toLocaleString()}</p>
                      <p className="text-xs text-[#6B625A]">{p.type} · {p.method.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#6B625A]">
                    {format(new Date(p.paidAt), "dd MMM yyyy")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Projects */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Active Projects</h3>
        {projects.filter(p => p.status !== "COMPLETED").length === 0 ? (
          <p className="text-sm text-[#6B625A]">No active projects.</p>
        ) : (
          <div className="space-y-3">
            {projects
              .filter(p => p.status !== "COMPLETED")
              .map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#EFE7DF] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.enquiryService}</p>
                    <p className="text-xs text-[#6B625A]">
                      {p.poNumber ? `PO: ${p.poNumber}` : "No PO"} · {p.siteAddress ?? "No site"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        background: `${statusColors[p.status]}18`, 
                        color: statusColors[p.status] 
                      }}
                    >
                      {p.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-xs text-[#6B625A] mt-1">
                      {((p.totalPaid / p.totalContractValue) * 100).toFixed(0)}% paid
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Recent Enquiries</h3>
        <div className="space-y-3">
          {enquiries.slice(0, 5).map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-[#EFE7DF] last:border-0">
              <div>
                <p className="text-sm font-medium">{e.serviceWanted}</p>
                <p className="text-xs text-[#6B625A]">
                  Interest: {Array(e.interestLevel).fill("●").join("")}
                  {Array(5 - e.interestLevel).fill("○").join("")}
                </p>
              </div>
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ 
                  background: `${statusColors[e.status]}18`, 
                  color: statusColors[e.status] 
                }}
              >
                {e.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white border border-[#D8C9BC] rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4 text-[#5A0E12]">Financial Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6B625A]">Total Quoted</span>
            <span className="font-medium">AED {totalQuoted.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B625A]">Total Contract Value</span>
            <span className="font-medium">AED {totalContractValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B625A]">Total Collected</span>
            <span className="font-medium text-[#0F6E56]">AED {totalPaid.toLocaleString()}</span>
          </div>
          <div className="border-t border-[#D8C9BC] pt-2 flex justify-between font-semibold">
            <span>Outstanding</span>
            <span className={`font-semibold ${outstanding > 0 ? "text-[#991B1B]" : "text-[#0F6E56]"}`}>
              AED {outstanding.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsTab({ payments }: { payments: CustomerFinancialSummary["payments"] }) {
  const [filter, setFilter] = useState<"all" | "PROJECT" | "QUOTATION">("all");
  
  const filtered = filter === "all" ? payments : payments.filter(p => p.sourceType === filter);

  return (
    <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EFE7DF] flex justify-between items-center">
        <h3 className="font-semibold text-sm">Payment History</h3>
        <div className="flex gap-2">
          {(["all", "PROJECT", "QUOTATION"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f 
                  ? "bg-[#5A0E12] text-white" 
                  : "bg-[#F8F5F2] text-[#6B625A] hover:bg-[#EFE7DF]"
              }`}
            >
              {f === "all" ? "All" : f === "PROJECT" ? "Projects" : "Quotations"}
            </button>
          ))}
        </div>
      </div>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
            <th className="text-left px-5 py-3 font-medium">Date</th>
            <th className="text-left px-5 py-3 font-medium">Source</th>
            <th className="text-left px-5 py-3 font-medium">Type</th>
            <th className="text-left px-5 py-3 font-medium">Method</th>
            <th className="text-left px-5 py-3 font-medium">Reference</th>
            <th className="text-right px-5 py-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-[#6B625A]">
                No payments found.
              </td>
            </tr>
          ) : (
            filtered.map(p => {
              const Icon = methodIcons[p.method] ?? CreditCard;
              return (
                <tr key={p.id} className="border-t border-[#F8F5F2] hover:bg-[#F8F5F2]/60">
                  <td className="px-5 py-3 text-[#6B625A]">
                    {format(new Date(p.paidAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-[#F8F5F2] px-2 py-0.5 rounded-full">
                      {p.sourceType === "PROJECT" ? "Project" : "Quote"}
                    </span>
                    <span className="text-xs text-[#6B625A] ml-2">{p.sourceNumber}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} className="text-[#6B625A]" />
                      <span>{p.method.replace(/_/g, " ")}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#6B625A]">{p.reference ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-[#5A0E12]">
                    AED {p.amount.toLocaleString()}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProjectsTab({ projects, expandedId, onToggle }: {
  projects: CustomerFinancialSummary["projects"];
  expandedId: string | null;
  onToggle: (id: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      {projects.map(project => {
        const isExpanded = expandedId === project.id;
        const progress = project.totalContractValue > 0 
          ? (project.totalPaid / project.totalContractValue) * 100 
          : 0;

        return (
          <div key={project.id} className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
            <div 
              className="p-5 cursor-pointer hover:bg-[#F8F5F2]/30 transition-colors"
              onClick={() => onToggle(isExpanded ? null : project.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-sm">{project.enquiryService}</h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        background: `${statusColors[project.status]}18`, 
                        color: statusColors[project.status] 
                      }}
                    >
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B625A] mt-1">
                    PO: {project.poNumber ?? "—"} · Site: {project.siteAddress ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">AED {project.totalContractValue.toLocaleString()}</p>
                  <p className="text-xs text-[#0F6E56]">{progress.toFixed(0)}% paid</p>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-[#6B625A] ml-3" /> : <ChevronDown size={16} className="text-[#6B625A] ml-3" />}
              </div>
              
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 bg-[#EFE7DF] rounded-full overflow-hidden">
                <div className="h-full bg-[#0F6E56] rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
            </div>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-[#EFE7DF]">
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">Contract Value</p>
                    <p className="font-semibold">AED {project.totalContractValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">Total Paid</p>
                    <p className="font-semibold text-[#0F6E56]">AED {project.totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">Balance</p>
                    <p className={`font-semibold ${project.balance > 0 ? "text-[#991B1B]" : "text-[#0F6E56]"}`}>
                      AED {project.balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {project.payments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-2">Payment History</p>
                    <div className="space-y-2">
                      {project.payments.map(p => (
                        <div key={p.id} className="flex justify-between text-sm py-1 border-b border-[#F8F5F2] last:border-0">
                          <span className="text-[#6B625A]">{format(new Date(p.paidAt), "dd MMM yyyy")} · {p.type}</span>
                          <span className="font-medium">AED {p.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link 
                    href={`/projects/${project.id}`}
                    className="text-xs text-[#5A0E12] hover:underline"
                  >
                    View Project →
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {projects.length === 0 && (
        <div className="bg-white border border-[#D8C9BC] rounded-xl p-8 text-center text-[#6B625A]">
          No projects yet.
        </div>
      )}
    </div>
  );
}

function QuotationsTab({ quotations, expandedId, onToggle }: {
  quotations: CustomerFinancialSummary["quotations"];
  expandedId: string | null;
  onToggle: (id: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      {quotations.map(quote => {
        const isExpanded = expandedId === quote.id;
        
        return (
          <div key={quote.id} className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
            <div 
              className="p-5 cursor-pointer hover:bg-[#F8F5F2]/30 transition-colors"
              onClick={() => onToggle(isExpanded ? null : quote.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-sm">{quote.quoteNumber}</h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        background: `${statusColors[quote.status]}18`, 
                        color: statusColors[quote.status] 
                      }}
                    >
                      {quote.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B625A] mt-1">{quote.enquiryService}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">AED {quote.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-[#6B625A]">Valid until {quote.validUntil ? format(new Date(quote.validUntil), "dd MMM yyyy") : "—"}</p>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-[#6B625A] ml-3" /> : <ChevronDown size={16} className="text-[#6B625A] ml-3" />}
              </div>
            </div>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-[#EFE7DF]">
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">Subtotal</p>
                    <p className="font-medium">AED {quote.subtotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">VAT ({quote.vatRate}%)</p>
                    <p className="font-medium">AED {quote.vatAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">Total</p>
                    <p className="font-semibold">AED {quote.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-1">Balance</p>
                    <p className={`font-semibold ${quote.balance > 0 ? "text-[#991B1B]" : "text-[#0F6E56]"}`}>
                      AED {quote.balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {quote.payments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#6B625A] mb-2">Payments</p>
                    <div className="space-y-2">
                      {quote.payments.map(p => (
                        <div key={p.id} className="flex justify-between text-sm py-1 border-b border-[#F8F5F2] last:border-0">
                          <span className="text-[#6B625A]">{format(new Date(p.paidAt), "dd MMM yyyy")} · {p.type}</span>
                          <span className="font-medium">AED {p.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <Link 
                    href={`/quotations/${quote.id}`}
                    className="text-xs text-[#5A0E12] hover:underline"
                  >
                    View Quote →
                  </Link>
                  <a 
                    href={`/api/quotations/${quote.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#6B625A] hover:text-[#5A0E12]"
                  >
                    📄 Download PDF
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {quotations.length === 0 && (
        <div className="bg-white border border-[#D8C9BC] rounded-xl p-8 text-center text-[#6B625A]">
          No quotations yet.
        </div>
      )}
    </div>
  );
}

function LedgerTab({ ledger }: { ledger: CustomerFinancialSummary["ledger"] }) {
  return (
    <div className="bg-white border border-[#D8C9BC] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EFE7DF]">
        <h3 className="font-semibold text-sm">Running Balance</h3>
        <p className="text-xs text-[#6B625A] mt-1">Chronological ledger of all debits and credits</p>
      </div>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F8F5F2] text-[#6B625A] text-[10px] uppercase tracking-widest">
            <th className="text-left px-5 py-3 font-medium">Date</th>
            <th className="text-left px-5 py-3 font-medium">Type</th>
            <th className="text-left px-5 py-3 font-medium">Description</th>
            <th className="text-left px-5 py-3 font-medium">Reference</th>
            <th className="text-right px-5 py-3 font-medium">Debit</th>
            <th className="text-right px-5 py-3 font-medium">Credit</th>
            <th className="text-right px-5 py-3 font-medium">Balance</th>
          </tr>
        </thead>
        <tbody>
          {ledger.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-8 text-center text-[#6B625A]">
                No ledger entries yet.
              </td>
            </tr>
          ) : (
            ledger.map(entry => (
              <tr 
                key={entry.id} 
                className={`border-t border-[#F8F5F2] ${
                  entry.type === "PAYMENT" ? "bg-green-50/30" : ""
                }`}
              >
                <td className="px-5 py-3 text-[#6B625A]">
                  {format(new Date(entry.date), "dd MMM yyyy")}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    entry.type === "QUOTE" ? "bg-blue-50 text-blue-700" :
                    entry.type === "PROJECT" ? "bg-purple-50 text-purple-700" :
                    "bg-green-50 text-green-700"
                  }`}>
                    {entry.type}
                  </span>
                </td>
                <td className="px-5 py-3">{entry.description}</td>
                <td className="px-5 py-3 text-[#6B625A] text-xs">{entry.reference}</td>
                <td className="px-5 py-3 text-right font-medium text-[#991B1B]">
                  {entry.debit > 0 ? `AED ${entry.debit.toLocaleString()}` : "—"}
                </td>
                <td className="px-5 py-3 text-right font-medium text-[#0F6E56]">
                  {entry.credit > 0 ? `AED ${entry.credit.toLocaleString()}` : "—"}
                </td>
                <td className="px-5 py-3 text-right font-bold">
                  AED {entry.balance.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}