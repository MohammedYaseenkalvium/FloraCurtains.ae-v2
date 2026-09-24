import Image from "next/image";
import { Search, Bell, User } from "lucide-react";

type TopHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

export function TopHeader({ user }: TopHeaderProps) {
  const displayName = user.name || user.email || "User";

  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-flora-border/50 bg-flora-glass-bg backdrop-filter backdrop-blur(12px) px-6 lg:px-8"
    >
      {/* Flora Logo */}
      <Image
        src="/images/flora-logo.png"
        alt="Flora Curtains"
        width={24}
        height={24}
        className="h-5 w-5"
      />

      {/* Search */}
      <div className="hidden w-full max-w-md md:block">
        <div className="flex items-center gap-3 rounded-lg border border-flora-border/20 bg-flora-surface/50 px-3 py-2">
          <Search
            size={17}
            strokeWidth={1.8}
            className="text-flora-muted"
          />

          <input
            type="search"
            aria-label="Search leads, customers, projects"
            placeholder="Search leads, customers, projects..."
            className="w-full bg-transparent text-sm text-flora-foreground outline-none placeholder:text-flora-muted"
          />
        </div>
      </div>

      {/* Right side: notifications, profile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-flora-muted/70 transition hover:bg-flora-surface/50 hover:text-flora-foreground"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-flora-primary/20" />
        </button>

        <div className="h-6 w-px bg-flora-border/20" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-flora-border/20">
            <User size={16} className="text-flora-muted" />
          </div>

          <div>
            <p className="text-sm font-medium text-flora-foreground">
              {displayName}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-flora-muted">
              {user.role || "Staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}