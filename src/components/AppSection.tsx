import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <section className="space-y-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 w-full text-left group"
      >
        <span className="text-2xl">{app.icon}</span>
        <h2 className={`text-xl font-bold ${app.color}`}>{app.name}</h2>
        <span className="text-sm text-text-muted">({bindings.length})</span>
        <span className="text-text-muted ml-auto transition-transform" style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)" }}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-6"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
