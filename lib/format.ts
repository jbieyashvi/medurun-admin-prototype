export const parseAmt = (s: string | number) =>
  parseInt(String(s).replace(/[^0-9]/g, "")) || 0;

export function fmtINR(n: number) {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2) + "Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(2) + "L";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export const initials = (s: string) => (s || "?").charAt(0).toUpperCase();
