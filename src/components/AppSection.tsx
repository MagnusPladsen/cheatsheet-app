import { useState } from "react";
import type { Binding, AppId } from "../types";
import { APPS } from "../constants";
import { BindingCard } from "./BindingCard";

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
    const cat = b.category || "General";
    (acc[cat] ??= []).push(b);
    return acc;
  }, {});

  const customCount = bindings.filter((b) => b.isCustom).length;
  const defaultCount = bindings.length - customCount;

  return (
    <section
      className="animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Section header — editorial rule style */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-4 w-full text-left group pb-3 border-b border-border mb-4"
      >
        <span className="text-lg">{app.icon}</span>
        <h2 className="font-display text-xl font-700 text-text-primary tracking-tight">
          {app.name}
        </h2>
        <span className="font-mono text-[11px] text-text-muted tracking-wider">
          {bindings.length}
          {customCount > 0 && defaultCount > 0 && (
            <span className="text-text-muted/60"> — {customCount}c / {defaultCount}d</span>
          )}
        </span>
        <span
          className="font-mono text-[10px] text-text-muted ml-auto transition-transform duration-150"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}
        >
          ▼
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catBindings]) => (
            <div key={category}>
              <h3 className="font-mono text-[10px] font-500 uppercase tracking-[0.2em] text-accent mb-2 pl-0.5">
                {category}
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
