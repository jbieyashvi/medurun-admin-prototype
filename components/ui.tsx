"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { icons, CircleCheck, CircleX, TriangleAlert } from "lucide-react";

/* ---- Lucide dynamic icon ---- */
export function Icon({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  const L = (icons as any)[name];
  if (!L) return null;
  return <L size={size} className={className} strokeWidth={1.6} />;
}

/* ---- Toast ---- */
type Toast = { msg: string; type: "success" | "warning" | "danger" };
const ToastCtx = createContext<(msg: string, type?: Toast["type"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = useCallback((msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="ti">
            {toast.type === "success" ? <CircleCheck size={16} /> : toast.type === "danger" ? <CircleX size={16} /> : <TriangleAlert size={16} />}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

/* ---- StatusBadge ---- */
export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={`badge ${status}`}>{label || status}</span>;
}

/* ---- StatCard (summary strip cell) ---- */
export function StatCard({ icon, value, label, onClick }: { icon: string; value: ReactNode; label: string; onClick?: () => void }) {
  return (
    <div className="stat" onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
      <div className="stat-ic"><Icon name={icon} size={18} /></div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ---- Modal ---- */
export function Modal({ open, onClose, title, sub, wide, children, footer }: {
  open: boolean; onClose: () => void; title: string; sub?: string; wide?: boolean;
  children: ReactNode; footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <button className="modal-x" onClick={onClose}><CircleXSmall /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---- SideDrawer ---- */
export function SideDrawer({ open, onClose, title, children, footer, headerAction }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; headerAction?: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="panel">
        <div className="panel-header">
          <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {headerAction}
            <button className="modal-x" onClick={onClose}><CircleXSmall /></button>
          </div>
        </div>
        <div className="panel-body">{children}</div>
        {footer && <div className="panel-foot">{footer}</div>}
      </div>
    </>
  );
}

function CircleXSmall() {
  return <Icon name="X" size={15} />;
}

/* ---- StatusBanner ---- */
export function Banner({ tone, icon, title, msg }: { tone: string; icon: string; title: string; msg: string }) {
  return (
    <div className={`banner ${tone}`}>
      <div className="banner-ic"><Icon name={icon} size={16} /></div>
      <div>
        <div className="banner-title">{title}</div>
        <div className="banner-msg">{msg}</div>
      </div>
    </div>
  );
}

/* ---- Empty state ---- */
export function Empty({ title = "No results", sub = "Try adjusting your filters." }: { title?: string; sub?: string }) {
  return (
    <div className="empty">
      <Icon name="SearchX" size={26} className="text-muted" />
      <div className="empty-title">{title}</div>
      <div className="text-sm text-muted">{sub}</div>
    </div>
  );
}
