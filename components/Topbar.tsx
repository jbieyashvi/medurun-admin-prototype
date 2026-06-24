"use client";
import { Icon } from "./ui";
import { PAGE_TITLES } from "@/lib/nav";

export function Topbar({ screen }: { screen: string }) {
  return (
    <header id="header">
      <div className="h-title">{PAGE_TITLES[screen] || "Dashboard"}</div>
      <div className="h-search"><Icon name="Search" size={15} /> Search anything...</div>
      <div className="h-notif"><Icon name="Bell" size={18} /><span className="dot" /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Arjun Mehta</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Super Admin</div>
        </div>
        <div className="h-avatar">AM</div>
      </div>
    </header>
  );
}
