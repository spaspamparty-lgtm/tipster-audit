# TIPSTER AUDIT

Next.js/TypeScript prototype for transparent sports-tipster analysis. Tipster identities, aggregate metrics, profile evidence and comparison charts are **fictional demo data**. Match Check is a separate external-data integration; saved checks are personal, unverified browser data.

## Run

Node.js 24 and npm, from the repository root:

```sh
npm ci
npm run dev
```

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Current workflows

- **Overview / Explorer / profiles:** demo metrics, search, sport filters, sorting, source-quality explanations and a subscription cost calculator. Yield is profit / stake, using fixed 1-unit resolved picks. Voids are excluded. Full-history drawdown and loss streaks are deliberately unavailable without the complete event ledger; the displayed drawdown uses only 15 illustrative chart points.
- **Analytics:** two distinct tipsters, shared stake, independent hypothetical monthly fees and synchronized profit curves. Duplicate selections swap the pair. No composite reliability score or automatic purchase recommendation.
- **Prediction Tracker / Match Check:** public ESPN scoreboard for Serie A, Premier League, La Liga, Bundesliga, Ligue 1 and Champions League. Select a date interval (up to 31 inclusive UTC calendar dates), filter by team/status, choose a match and a full-time market. The browser fetches results without keys; no ingestion job or paid service is active.
- **I miei controlli:** one-click save, browser-local persistence, search, outcome filters, aggregate win/loss/pending counts, JSON backup export/import. Import is additive and existing checks win. Explicitly update saved outcomes from the matches currently loaded in the tracker; previous source readings remain in a revision history. No automatic background updates or multi-device synchronization. Missing/corrupt or blocked storage prevents writes rather than clearing an existing archive. Other-tab changes are observed with storage events, with an optimistic stale-write check; localStorage is not a transactional database.
- **Navigation:** hash URLs restore the selected section/profile and support browser back/forward. Account and subscription pages remain previews; no login or payment is active.

### Match result semantics and limitations

ESPN is a sports-data source, **not the official feed of the leagues**. The public, unversioned scoreboard endpoint has no contractual availability guarantee. No commercial license is implied. This integration requires live browser/CORS validation; the onboarding machine currently receives proxy CONNECT 403 responses for the provider and GitHub Pages. Synthetic browser tests are not proof of live connectivity. Needed egress additions have been saved in the cloud configuration draft, but saving does not apply them to the running instance.

The parser validates IDs, names, dates, scores and completion state; home/away assignment does not rely on array order. Only a completed match with valid scores can settle. Extra time, penalties, canceled/abandoned/awarded states and unsupported periods are excluded when indicated by provider status; if provider metadata is incomplete, settlement cannot independently establish regulation-time correctness. Supported markets: 1X2, over/under 2.5 and both teams score. No bookmaker-specific voids, live markets, handicap, odds or profit calculations exist in Match Check. Provider errors, malformed responses, empty calendars and timeouts are visible; there is no fabricated fallback. Requests abort on filter changes/unmount; fetching resets the selected match. Refresh is manual.

Saved checks record the source reading and the local save time, both editable outside the application and untrusted after import. A check saved before kickoff does **not** independently prove a pre-event prediction. A retrospective check never authenticates a tipster. Historical reads can be inspected; they are not a certified audit trail. Counters describe saved checks, possibly multiple markets per match, not a tipster's overall performance. Export backups regularly: clearing browser data removes local history. Limits: 1,000 checks, 50 revisions per check, 2 MB import/export schema size.

## Browser regression tests

```sh
npx playwright install chromium
npm run test:browser
npm run test:matches
```

Start the application first. Optional environment variables: `APP_URL` (default `http://127.0.0.1:3000`) and `CHROMIUM_PATH` (system Chromium path). Match tests intercept the provider with explicitly synthetic fixtures. They cover league/search filters, full-time/pending/unsupported outcomes, save/reload, revisions, import/export, invalid files, archive corruption preservation, provider error/retry, navigation and mobile overflow. Comparison tests cover separate fees, shared stake, invalid inputs, selection swapping and chart synchronization. `npm test` covers pure calculations, parsing, bounded query construction, backup validation, additive merging and revisions.

## GitHub Pages

```sh
STATIC_EXPORT=1 npm run build
```

Export `out/` uses base path `/tipster-audit`. Publish its contents to `gh-pages` with `.nojekyll`; GitHub repository Pages settings must use that branch's root. Source is on `tipster-audit-demo`; `main` may still contain the initial LICENSE only. Sending commits does not confirm Pages deployment. No Git worktree is needed in isolated cloud tasks.

## Architecture and production work remaining

- App Router application shell, React client workspace, typed data/metrics/provider adapters, Recharts, Lucide and responsive custom CSS.
- `lib/match-results.ts`: provider adapters and supported market settlement. `lib/saved-checks.ts`: versioned local archive schema and pure merge/revision functions. `components/match-tracker.tsx` and `components/saved-checks.tsx`: result workflow. Demo profile data remains separate in `lib/data.ts`.
- A production backend should use PostgreSQL (e.g. Supabase), server-side licensed source adapters, scheduled ingestion, request budgets/cache, immutable evidence provenance and reviewed result revisions. A tipster registry needs genuine published predictions; match scores alone cannot populate it.
- Supabase Auth and row-level security are required before storing private multi-user histories. Public stats should use reviewed read views. Signed, replay-resistant Whop webhooks must update server-owned entitlements; browser plan state must never authorize Pro access.
- Production requires provider licensing/coverage confirmation, a connected backend hosting account/database and actual end-to-end authentication/billing/ingestion tests. These have **not** been provisioned or claimed as complete. No paid service has been activated.
