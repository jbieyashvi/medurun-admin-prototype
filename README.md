# Medurun — Super Admin (Next.js)

Structured Next.js port of the Medurun ambulance-platform super admin prototype.
Frontend only, static dummy data, no backend.

## Stack
- Next.js 14 (App Router) · React 18 · TypeScript
- Tailwind CSS + ported design-system CSS (`app/globals.css`)
- Lucide icons (`lucide-react`)

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure
```
app/            layout.tsx, page.tsx (app shell + auth + screen routing), globals.css
components/     Sidebar, Topbar, StatCard, DataTable, SideDrawer, Modal, StatusBadge, ui (toast/Icon/Banner)
modules/        one folder-equivalent component per screen (Dashboard, AgencyManagement, ... PayoutManagement)
data/           static dummy data (agencies, drivers, ambulances, tickets, documents, revenue, payouts, employees)
lib/            nav config + formatting helpers
```

## Notes
- Screen switching is handled client-side in `app/page.tsx` via the sidebar (SPA-style, matching the original prototype). Add real routes under `app/<screen>/page.tsx` to migrate to URL-based routing.
- Every module shares the same engine: summary cards → filters → `DataTable` → `SideDrawer` / `Modal`. Filters, drawers, modals and status transitions all work on the dummy data.
- The original single-file prototype remains at `index.html` (GitHub Pages build) and is untouched.
