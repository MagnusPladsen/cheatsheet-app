import { useState, useRef, useEffect, type RefObject } from "react";
import { exportToPng, exportToPdf, downloadBytes } from "../utils/exportUtils";
import { lc } from "../utils/text";

interface ExportButtonProps {
  contentRef: RefObject<HTMLElement | null>;
  onSaveFile?: (data: Uint8Array, defaultName: string, mime: string) => Promise<void>;
}

export function ExportButton({ contentRef, onSaveFile }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async (format: "png" | "pdf") => {
    if (!contentRef.current || exporting) return;
    setExporting(true);
    setOpen(false);
    try {
      const isPng = format === "png";
      const data = isPng
        ? await exportToPng(contentRef.current)
        : await exportToPdf(contentRef.current);
      const filename = isPng ? "cheatsheet.png" : "cheatsheet.pdf";
      const mime = isPng ? "image/png" : "application/pdf";

      if (onSaveFile) {
        await onSaveFile(data, filename, mime);
      } else {
        downloadBytes(data, filename, mime);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        disabled={exporting}
        className="px-2 py-1 text-xs text-text-muted hover:text-accent border border-transparent hover:border-accent/20 transition-colors tracking-wider disabled:opacity-50"
      >
        {exporting ? lc("exporting...") : lc("export")}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-bg-secondary border border-border shadow-lg min-w-[8rem]">
          <button
            onClick={() => handleExport("png")}
            className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors tracking-wider"
          >
            {lc("save as png")}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-accent-dim hover:text-accent transition-colors tracking-wider"
          >
            {lc("save as pdf")}
          </button>
        </div>
      )}
    </div>
  );
}
