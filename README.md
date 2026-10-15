# TIPSTER AUDIT

Premium sports-tipster analytics prototype. All identities, predictions, events, historical performance and evidence labels are **fictional demo data**. No independent verification or financial service is active.

## Develop

Node.js 24 and npm. From the repository root:

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run build
npm run typecheck
npm start
```

The production server listens on port 3000. Dashboard, Explorer, profiles, tracker, comparisons, methodology and plan preview are navigable within the client workspace. Filters and comparison selections are in-memory. CSV exports contain only the four explicitly illustrative tracker records. September aggregate data and October sample tracker records are separate datasets. Yield is profit / resolved picks with fixed 1-unit stakes, excluding voids; it is also ROI on stake, not bankroll return.

## Architecture

- Next.js App Router, React, TypeScript: server application shell and interactive client workspace.
- Recharts: responsive interactive charts; Lucide: consistent icons; custom responsive CSS design system.
- `lib/data.ts`: typed demo data and statistical helpers. `components/workspace.tsx`: first application workspace. `app/`: document, entry point and styles.
- Fonts use Google Fonts with system fallbacks; no remote dependency is required for the application to start.

### Backend roadmap (not implemented)

Supabase PostgreSQL with tables for profiles, tipsters, predictions, immutable source evidence, result revisions, watchlists and subscription entitlements. Store decimal odds, stake and profit as numeric values, timestamps as UTC `timestamptz`. Evidence must retain source URL, capture timestamp and review provenance; verification requires independent evidence and never follows from profitability alone.

Supabase Auth with server-side sessions and row-level security for account-owned records. Public statistics use reviewed read views. Server routes validate inputs and calculate aggregates from settled records; pagination and period/sport/market filters move to database queries. Add ingestion jobs with idempotent source IDs, immutable revisions and manual evidence review.

Whop integration uses a signed, replay-resistant webhook endpoint and idempotent event persistence; server-owned entitlements determine Pro access. Never rely on client-side plan state for authorization. No paid service, account provisioning or deployment has been activated.

Next steps: split the workspace into addressable routes, add a PostgreSQL adapter and migrations, implement authentication and functional browser tests, then connect verified source ingestion. Production readiness requires real data provenance, backend access control, rate limits and subscription lifecycle tests.

## GitHub Pages demo

`STATIC_EXPORT=1 npm run build` generates `out/` with base path `/tipster-audit`. Publish the contents to branch `gh-pages` with an empty `.nojekyll` file. GitHub repository Settings → Pages must use Deploy from a branch → gh-pages → /(root). This static demo has no server-side authentication, database or payment endpoints.

### Decision-focused profiles

Profiles separate provenance, performance and risk. Drawdown is computed only over the 15 illustrative cumulative-profit points; full-history drawdown and consecutive losses are deliberately unavailable without an event ledger. The subscription calculator applies one hypothetical monthly fee to September's fictional aggregate, with a constant stake, and does not project future returns. It excludes commissions, taxes, odds changes and missed picks. Calculator state is reset when changing profile.

Run `npm test` for financial-calculation and drawdown edge cases. Browser validation covers the static export, loss after subscription cost, invalid stake recovery and mobile overflow.

### Paired comparisons

Analytics now compares exactly two distinct tipsters over September 2026, with a common stake and independently editable hypothetical monthly fees. Selecting the other tipster swaps the pair; each fee stays associated with its tipster while the page is open. Selections also drive the cumulative-profit chart. Risk, provenance and net-after-cost outcomes are shown separately, without a composite reliability score or automatic recommendation. Fees and stake are session-only UI state.

Browser regression test: run the application, then `npx playwright install chromium` once and `npm run test:browser`. Override `APP_URL` for a static export (including `/tipster-audit/`) and optionally `CHROMIUM_PATH` to use an installed Chromium. This covers selection swapping, independent fees, shared stake, negative net outcomes, invalid inputs, profile navigation and mobile overflow.

### Match Check beta

Prediction Tracker now loads Bundesliga matches directly from the public OpenLigaDB API (`https://api.openligadb.de/getmatchdata/bl1/{season}`), without keys or paid provisioning. OpenLigaDB is community-maintained, **not an official league source**. Provider availability and browser CORS compatibility must be validated on the published site; live access from this onboarding machine currently fails at the network proxy (CONNECT 403), not at the application. Draft egress additions for `api.openligadb.de` and `www.openligadb.de` are saved but not runtime-applied or published automatically.

Search filters the selected season; up to 60 matches are displayed at once, newest kickoff first. Select a match and a supported full-time market (1X2, over/under 2.5, both teams score). Settlement requires `matchIsFinished` and a valid `matchResults` entry with `resultTypeID: 2`. Half-time and missing/unfinished results never settle. Provider rows are validated and failures are explicit; there is no demo fallback. Season/refresh changes clear previous selections and results. Each fetch has a 15-second timeout and abort cleanup. Retrieval time and browser timezone are displayed. Use Refresh to fetch again; no background ingestion is running.

This is an unsaved result calculator, not an audit trail or evidence that a tipster made a pre-event prediction. There is no persistent history, bookmaker-specific void handling, extra-time/penalty settlement, betting or financial return calculation. Demo aggregates elsewhere are unchanged and are not fed from match results.

`npm run test:matches` uses intercepted, explicitly synthetic API fixtures to exercise the static-export UI. It verifies search, full-time settlement, missing/pending scores, error/retry, season reset and mobile overflow. It does **not** validate live provider connectivity. `npm test` includes provider parsing and all supported markets. Set `APP_URL` and optionally `CHROMIUM_PATH` as for the comparison browser tests.
