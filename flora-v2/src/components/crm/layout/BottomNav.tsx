"use client";

import { useEffect, useState } from "react";
import { Search, Bell, User, Settings, Calendar, Package, Users as UsersIcon, Home } from "lucide-react";

interface BottomNavItem {
  key: string;
  icon: React.ElementType;
  label: string;
}

const navItems: BottomNavItem[] = [
  { key: "dashboard", icon: Home, label: "Dashboard" },
  { key: "enquiries", icon: UsersIcon, label: "Enquiries" },
  { key: "projects", icon: Package, label: "Projects" },
  { key: "quotations", icon: Settings, label: "Quotations" },
  { key: "payments", icon: Calendar, label: "Payments" },
  { key: "tasks", icon: UsersIcon, label: "Tasks" },
  { key: "profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (key: string) => key === active;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-flora-border border-solid border-y-2 pb-4 px-4 sm:px-6"
      style={{ bottom: mobile ? 80 : 72 }}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-center gap-2 sm:gap-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`flex flex-col items-center justify-center rounded-lg py-2 px-2 transition-colors duration-200 ${
              isActive(item.key)
                ? "bg-flora-primary/20 text-flora-primary border border-flora-primary/30"
                : "text-flora-muted hover:text-flora-primary hover:border-transparent"
            }`}
            aria-label={item.label}
          >
            <item.icon
              className="h-6 w-6 sm:h-7 sm:w-7 mx-auto"
            />
            <span className="mt-1 text-xs sm:mt-0 text-flora-medium sm:text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}