import { useState, useRef, useCallback, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top - 4,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const r = el.getBoundingClientRect();
    if (r.left < 8) {
      el.style.transform = `translateX(${8 - r.left}px) translateX(-50%) translateY(-100%)`;
    } else if (r.right > window.innerWidth - 8) {
      el.style.transform = `translateX(${window.innerWidth - 8 - r.right}px) translateX(-50%) translateY(-100%)`;
    }
  }, [visible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      className="flex-1 min-w-0"
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{ top: position.top, left: position.left, transform: "translateX(-50%) translateY(-100%)" }}
        >
          <div className="px-2.5 py-1.5 text-xs text-accent-light bg-bg-primary border border-accent/20 shadow-[0_0_12px_rgba(0,255,136,0.06)] max-w-xs whitespace-pre-wrap break-words">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
