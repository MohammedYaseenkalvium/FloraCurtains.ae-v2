"use client";

import { Component, Fragment, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RegionErrorCardProps {
  title: string;
  onRetry: () => void;
}

/**
 * Inline per-region failure card. Renders only the generic title plus Retry —
 * raw errors never cross into UI copy (extends the src/lib/api.ts no-leak
 * rule). Danger triple keeps failure visually distinct from neutral empties.
 */
export function RegionErrorCard({ title, onRetry }: RegionErrorCardProps) {
  return (
    <div
      role="alert"
      className="rounded-flora-md border border-flora-border bg-white p-5 shadow-flora-sm"
    >
      <div className="flex items-start gap-3 text-flora-danger bg-flora-danger-surface border border-flora-danger/30 rounded-flora-md px-4 py-3">
        <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
        </div>
      </div>
      <div className="mt-4">
        <Button variant="secondary" size="md" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

interface RegionBoundaryProps {
  region: string;
  title: string;
  children: ReactNode;
}

interface RegionBoundaryState {
  failed: boolean;
  nonce: number;
}

/**
 * Minimal client error boundary for one dashboard region. Retry bumps a
 * nonce that remounts the children (keyed remount), so the async server
 * region re-streams through the existing server read path — no client fetch,
 * no query params, session auth() check intact. Healthy sibling regions are
 * untouched (silent degrade, no page-wide alarm).
 */
export class RegionBoundary extends Component<RegionBoundaryProps, RegionBoundaryState> {
  state: RegionBoundaryState = { failed: false, nonce: 0 };

  static getDerivedStateFromError(): Partial<RegionBoundaryState> {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(`Dashboard region failed: ${this.props.region}`, error);
  }

  private handleRetry = () => {
    this.setState((state) => ({ failed: false, nonce: state.nonce + 1 }));
  };

  render() {
    if (this.state.failed) {
      return <RegionErrorCard title={this.props.title} onRetry={this.handleRetry} />;
    }
    return <Fragment key={this.state.nonce}>{this.props.children}</Fragment>;
  }
}
