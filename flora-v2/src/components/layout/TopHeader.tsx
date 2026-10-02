import { FloraLogo } from "@/components/public/FloraLogo";

type TopHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

/**
 * CRM top bar: proper brand mark (desktop — mobile reserves the left
 * corner for the navigation hamburger), user identity on the right.
 * Deliberately no decorative search/notifications — nothing fake.
 */
export function TopHeader({ user }: TopHeaderProps) {
  const displayName = user.name || user.email || "User";

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-flora-border/60 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <a
        href="/dashboard"
        className="hidden md:block"
        aria-label="Flora Curtains — dashboard"
      >
        <FloraLogo width={112} height={28} className="h-7 w-auto object-contain" />
      </a>

      {/* Mobile: the fixed hamburger sits in this corner */}
      <div className="md:hidden" aria-hidden="true" />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-flora-cream">
          <span
            aria-hidden="true"
            className="text-sm font-semibold text-flora-primary"
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium text-flora-foreground">
            {displayName}
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-flora-muted">
            {user.role || "Staff"}
          </p>
        </div>
      </div>
    </header>
  );
}
