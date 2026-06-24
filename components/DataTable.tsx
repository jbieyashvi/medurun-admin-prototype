"use client";
import { ReactNode } from "react";
import { Empty } from "./ui";

export type Column<T> = {
  key: string;
  label: ReactNode;
  render?: (row: T, i: number) => ReactNode;
  className?: string;
  onSort?: () => void;
};

export function DataTable<T>({
  columns, rows, onRowClick, getKey, emptyTitle,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T, i: number) => void;
  getKey?: (row: T, i: number) => string | number;
  emptyTitle?: string;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} onClick={c.onSort} style={c.onSort ? { cursor: "pointer", userSelect: "none" } : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}><Empty title={emptyTitle || "No matching records"} /></td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={getKey ? getKey(row, i) : i}
                className={onRowClick ? "clickable" : ""}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={c.className}>
                    {c.render ? c.render(row, i) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* shared filter input helpers */
export function FilterRow({ children }: { children: ReactNode }) {
  return <div className="filter-row">{children}</div>;
}
export function Search({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className="filter-input" style={{ minWidth: 200 }} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
}
export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className="filter-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
