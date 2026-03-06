import { useState } from "react";
import type { AppId, SearchResult } from "../types";
import { APPS } from "../constants";
import { BindingCard } from "./BindingCard";
import { lc } from "../utils/text";

interface AppSectionProps {
  appId: AppId;
  results: SearchResult[];
  index: number;
}

export function AppSection({ appId, results, index }: AppSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const app = APPS[appId];

  if (results.length === 0) return null;

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const cat = r.binding.category || "general";
    (acc[cat] ??= []).push(r);
    return acc;
  }, {});

  const customCount = results.filter((r) => r.binding.isCustom).length;
  const defaultCount = results.length - customCount;

  return (
    <section
      className="animate-fade-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full text-left group pb-2 border-b border-border mb-3"
      >
        <span className="text-accent text-sm">#</span>
        <h2 className="text-sm font-bold text-text-primary">{lc(app.name)}</h2>
        <span className="text-xs text-text-muted tracking-wider">
          [{results.length}]
          {customCount > 0 && defaultCount > 0 && (
            <span className="ml-1 text-text-muted/70">{customCount}c/{defaultCount}d</span>
          )}
        </span>
        <span
          className="text-xs text-text-muted ml-auto transition-transform duration-100"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}
        >
          ▾
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, catResults]) => (
            <div key={category}>
              <h3 className="text-xs text-accent/70 tracking-widest mb-1.5 pl-0.5">
                -- {lc(category)}
              </h3>
              <div className="grid gap-px sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {catResults.map((r) => (
                  <BindingCard key={r.binding.id} binding={r.binding} matches={r.matches} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
