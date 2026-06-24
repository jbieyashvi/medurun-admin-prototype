"use client";
import { NAV } from "@/lib/nav";
import { Icon } from "./ui";

export function Sidebar({ active, onNavigate, onSignOut }: {
  active: string; onNavigate: (key: string) => void; onSignOut: () => void;
}) {
  return (
    <aside id="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon"><Icon name="Ambulance" size={17} /></div>
        <div>
          <div className="sb-logo-text">Medurun</div>
          <div className="sb-logo-sub">Super Admin</div>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV.map((section) => (
          <div key={section.title}>
            <div className="sb-section">{section.title}</div>
            {section.items.map((item) => (
              <button
                key={item.key}
                className={`sb-item ${active === item.key ? "active" : ""}`}
                onClick={() => onNavigate(item.key)}
              >
                <span className="ic"><Icon name={item.icon} size={18} /></span>
                {item.label}
                {item.badge && <span className="badge-count">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sb-bottom">
        <button className="sb-item" onClick={onSignOut}>
          <span className="ic"><Icon name="LogOut" size={18} /></span>Sign Out
        </button>
      </div>
    </aside>
  );
}
