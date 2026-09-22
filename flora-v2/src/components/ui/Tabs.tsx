"use client";

import { useState, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  count?: number | null;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabDef[];
  defaultTab?: string;
}

/**
 * Underline tab navigation (reference: CRM tab bars).
 * All panels server-render; the client only toggles visibility.
 * Keyboard: Left/Right arrows move between tabs.
 */
export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  function onKeyDown(event: React.KeyboardEvent) {
    const ids = tabs.map((t) => t.id);
    const i = ids.indexOf(active);
    if (event.key === "ArrowRight") setActive(ids[(i + 1) % ids.length]);
    if (event.key === "ArrowLeft") setActive(ids[(i - 1 + ids.length) % ids.length]);
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Sections"
        onKeyDown={onKeyDown}
        className="flex gap-6 overflow-x-auto border-b border-flora-border"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flora-primary focus-visible:ring-offset-2 ${
              active === tab.id
                ? "border-b-2 border-flora-primary text-flora-primary"
                : "text-flora-muted hover:text-flora-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-flora-surface px-1.5 py-0.5 text-[10px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          hidden={active !== tab.id}
          className="pt-5"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
