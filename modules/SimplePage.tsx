"use client";
import { PageHeader } from "./shared";
import { Icon } from "@/components/ui";

export function SimplePage({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <PageHeader title={title} sub={sub} />
      <div className="card pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 56, textAlign: "center" }}>
        <Icon name="LayoutDashboard" size={28} className="text-muted" />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div className="text-sm text-muted" style={{ maxWidth: 360 }}>
          This module is part of the Medurun admin and follows the same module pattern. Connect data and extend in <code>modules/</code>.
        </div>
      </div>
    </div>
  );
}
