import { Bell, Search } from "lucide-react";

type TopHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
};

export function TopHeader({ user }: TopHeaderProps) {
  const displayName = user.name || user.email || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-flora-border bg-white/95 px-6 backdrop-blur lg:px-8">
      {/* Search */}
      <div className="hidden w-full max-w-md md:block">
        <div className="flex items-center gap-3 rounded-lg border border-flora-border bg-flora-surface px-3 py-2">
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

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-flora-muted transition hover:bg-flora-surface hover:text-flora-foreground"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-flora-primary" />
        </button>

        <div className="h-6 w-px bg-flora-border" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-flora-foreground">
              {displayName}
            </p>

            <p className="text-[11px] uppercase tracking-wider text-flora-muted">
              {user.role || "Staff"}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-flora-primary text-xs font-semibold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}