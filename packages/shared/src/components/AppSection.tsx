import { useState } from "react";
import type { Binding, AppId } from "../types";
import { APPS } from "../constants";
import { BindingCard } from "./BindingCard";
import { lc } from "../utils/text";

interface AppSectionProps {
  appId: AppId;
  bindings: Binding[];
  index: number;
}

export function AppSection({ appId, bindings, index }: AppSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const app = APPS[appId];

  if (bindings.length === 0) return null;

  const grouped = bindings.reduce<Record<string, Binding[]>>((acc, b) => {
    const cat = b.category || "general";
    (acc[cat] ??= []).push(b);
    return acc;
  }, {});

  const customCount = bindings.filter((b) => b.isCustom).length;
  const defaultCount = bindings.length - customCount;

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
          [{bindings.length}]
          {customCount > 0 && defaultCount > 0 && (
            <span className="ml-1 text-text-muted/50">{customCount}c/{defaultCount}d</span>
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
          {Object.entries(grouped).map(([category, catBindings]) => (
            <div key={category}>
              <h3 className="text-xs text-accent/50 tracking-widest mb-1.5 pl-0.5">
                -- {lc(category)}
              </h3>
              <div className="grid gap-px sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {catBindings.map((b) => (
                  <BindingCard key={b.id} binding={b} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
