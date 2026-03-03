import { useState, useRef, useEffect } from "react";
import type { Binding } from "../types";
import { encodeBindings, buildShareUrl } from "../utils/shareUrl";
import { lc } from "../utils/text";

interface ShareButtonProps {
  bindings: Binding[];
  filteredBindings: Binding[];
  activeCategory: string | null;
}

export function ShareButton({ bindings, filteredBindings, activeCategory }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const share = async (selection: Binding[]) => {
    const encoded = encodeBindings(selection);
    const url = buildShareUrl(encoded);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
      >
        {copied ? lc("copied!") : lc("share")}
      </button>

      {open && !copied && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-bg-secondary border border-border shadow-lg min-w-[12rem]">
          <button
            onClick={() => share(bindings)}
            className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors tracking-wider"
          >
            {lc("share all bindings")} [{bindings.length}]
          </button>
          {activeCategory && (
            <button
              onClick={() => share(filteredBindings)}
              className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors tracking-wider"
            >
              {lc(`share "${activeCategory}"`)} [{filteredBindings.length}]
            </button>
          )}
          {filteredBindings.length !== bindings.length && !activeCategory && (
            <button
              onClick={() => share(filteredBindings)}
              className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors tracking-wider"
            >
              {lc("share current view")} [{filteredBindings.length}]
            </button>
          )}
        </div>
      )}
    </div>
  );
}
