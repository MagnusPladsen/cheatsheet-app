import { useState } from "react";
import type { Binding, AppId } from "../types";
import { APPS } from "../constants";
import { BindingCard } from "./BindingCard";

interface AppSectionProps {
  appId: AppId;
  bindings: Binding[];
}

export function AppSection({ appId, bindings }: AppSectionProps) {
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
    <section>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 w-full text-left mb-3 group"
      >
        <span className="text-2xl">{app.icon}</span>
        <h2 className={`text-xl font-bold ${app.color}`}>{app.name}</h2>
        <span className="text-sm text-text-muted">
          {bindings.length} {customCount > 0 && defaultCount > 0 && `(${customCount} custom, ${defaultCount} default)`}
        </span>
        <span
          className="text-text-muted ml-auto transition-transform duration-150"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}
        >
          ▾
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catBindings]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 pl-1">
                {category}
              </h3>
              <div className="grid gap-1.5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
