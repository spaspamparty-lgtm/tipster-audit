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
