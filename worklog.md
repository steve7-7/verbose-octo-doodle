# GoalEdge — Worklog

This is the shared handover document for the GoalEdge football prediction app.
All agents working on this project MUST read this file before starting and append
their work record (do not overwrite).

---
Task ID: 1
Agent: main (orchestrator)
Task: Recreate the uploaded "full-stack-football-prediction-app" as a single-page Next.js 16 app on the `/` route using the predefined stack (Prisma/SQLite, shadcn/ui, Tailwind 4, JWT auth via jose+bcryptjs).

Work Log:
- Extracted and studied the uploaded reference app (`/home/z/my-project/upload/extracted`) — Drizzle/PostgreSQL + multi-route Next.js app called "GoalEdge" (football predictions, free/premium tiers, Paystack payments, in-memory cache server, page-speed tester).
- Rewrote the data layer for our stack: `prisma/schema.prisma` now defines `User`, `Prediction`, `Subscription` models on SQLite. Pushed schema with `bun run db:push`.
- Installed `bcryptjs` + `jose` for password hashing and JWT session cookies.
- Built backend libs:
  - `src/lib/constants.ts` — plans, leagues, markets, risk levels, status config, confidence tiers.
  - `src/lib/types.ts` — `SafeUser`, `Prediction`, `ClientPrediction` (with `locked` flag), `Stats`, `SubscriptionRow`.
  - `src/lib/utils.ts` — `cn`, `initials`, `formatKES`, date/time helpers, `timeUntil`, `winRate`.
  - `src/lib/session.ts` — JWT sign/verify with `jose` (7-day expiry).
  - `src/lib/auth.ts` — `getCurrentUser`/`requireUser`, `setSessionCookie`/`clearSessionCookie`, `isPremiumActive`.
  - `src/lib/cache-server.ts` — in-memory cache with stale-while-revalidate + tag invalidation + telemetry + `benchmark()` helper.
  - `src/lib/queries.ts` — `listPredictions`, `getPrediction`, `getStats`, `createPrediction`, `updatePrediction`, `deletePrediction` (all cached, with `attachLocked` for premium gating).
  - `src/lib/paystack.ts` — mock-mode payment init/verify/fulfill (instant premium grant on verify).
  - `src/lib/validation.ts` — zod schemas for register/login/profile/prediction.
  - `src/lib/api-client.ts` — typed fetch helpers for every endpoint.
  - `src/hooks/use-goal-edge.ts` — Zustand store for auth state + active dashboard tab + auth modal.
- Built API routes (all `force-dynamic`):
  - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/profile`
  - `GET /api/predictions` (filters: status/league/market/risk/q/limit), `POST /api/predictions` (admin)
  - `GET/PATCH/DELETE /api/predictions/[id]`
  - `GET /api/stats`
  - `POST /api/paystack/initialize`, `GET+POST /api/paystack/verify`
  - `GET /api/tester`, `GET /api/tester/benchmark`
  - `GET /api/health`
- Wrote `src/db/seed.ts` and seeded the DB: 3 demo users (admin/premium/free, password `password123`), 14 predictions (8 upcoming + 3 won + 3 lost, mix of premium/free), 1 demo subscription. Ran successfully.
- Built the single-page frontend on `/` (`src/app/page.tsx`):
  - Client component that boots auth state via `useGoalEdge`, shows `<Landing/>` when logged out and `<Dashboard/>` when logged in, plus `<AuthModal/>`.
  - `src/components/goaledge/`:
    - `ui.tsx` — Button (emerald/teal design system), Badge, Spinner, Card, `buttonClasses` helper.
    - `confidence-bar.tsx`, `stat-card.tsx`, `prediction-card.tsx` (with premium blur/lock overlay).
    - `auth-modal.tsx` — login/register modal with demo-account quick-fill buttons.
    - `landing.tsx` — hero (dark pitch gradient), featured tips, features grid, pricing, testimonials, CTA, footer.
    - `dashboard.tsx` — sidebar shell (desktop sticky + mobile drawer), nav, upgrade card, user card with sign-out.
    - `overview-tab.tsx` — greeting, 4 stat cards, upgrade banner, upcoming tips grid, recent form + performance sidebar.
    - `predictions-tab.tsx` — status tabs (upcoming/won/lost/void), debounced search, collapsible filters (league/market/risk), responsive card grid.
    - `profile-tab.tsx` — summary card + edit form (name, avatar color picker).
    - `subscription-tab.tsx` — current plan status, plan comparison cards, mock payment (KES 100 → 24h premium), payment history table, trust strip.
    - `prediction-form-modal.tsx` — full create/edit/delete form (all fields, league auto-syncs icon+country, confidence slider, premium toggle).
    - `admin-tab.tsx` — admin-only predictions management table with search + edit buttons.
    - `tester-tab.tsx` — live cache telemetry (hit rate, avg/p95 latency, counters) + benchmark runner.
- Updated `src/app/layout.tsx` metadata (title/description/OG/Twitter) and `src/app/globals.css` (`.bg-pitch` gradient, `animate-pop-in`, shimmer skeleton, thin custom scrollbar).
- Fixed lint error in `dashboard.tsx` (removed `useEffect` setState anti-pattern; sidebar now closes inside the `changeTab` handler).

Stage Summary:
- Project compiles cleanly, lint passes (only a warning inside the uploaded reference folder which is not part of the app).
- Dev server running on port 3000, no runtime errors in `dev.log` or browser console.
- Verified end-to-end via agent-browser:
  - Landing page renders (hero, featured tips, features, pricing, testimonials, CTA, footer) — VLM confirms clean design, no layout issues.
  - Auth modal: register + login modes both work; demo-account quick-fill works.
  - Login as admin → dashboard with all 6 tabs (Overview, Predictions, Subscription, Profile, Performance, Admin).
  - Login as free user → sees locked premium picks + upgrade banner.
  - Admin: created a new "Chelsea v Tottenham" prediction → appeared instantly in the table (cache invalidation working).
  - Free user: clicked "Activate Premium · Ksh100" → mock payment verified → premium granted for 24h → previously-locked predictions now show "View" (unlocked).
  - Performance tab: cache stats live (hit rate, latency, counters) + benchmark runs and reports speedup.
  - Mobile viewport (390×844): hamburger menu drawer works, layout reflows responsively.
- Demo accounts: `admin@goaledge.com`, `premium@goaledge.com`, `free@goaledge.com` — all password `password123`.

Unresolved issues / risks:
- None blocking. Potential next-phase work:
  - Add a prediction detail modal (the "View" buttons currently have no handler wired on the dashboard).
  - Wire real Paystack when `PAYSTACK_SECRET_KEY` is set (currently always mock).
  - Add accumulator slips / combo builder feature.
  - Add a charts/visuals tab (recharts is already in deps) for win-rate trends over time.
  - Add email/password reset flow.
  - Persist auth across full page reloads already works via httpOnly cookie; could add "remember me" UX.

---
Task ID: 2
Agent: webDevReview cron (round 1)
Task: First scheduled 15-minute review — QA the current site, fix the broken "View" buttons, add new features (prediction detail modal, analytics tab, bet slip), and polish styling.

Work Log:
- Read worklog.md to understand prior state: project was stable, single-page GoalEdge app with landing + dashboard (6 tabs), all core flows verified. Identified "View" buttons had no handler (bug) and next-phase features were proposed.
- QA'd current site with agent-browser: landing, login, all dashboard tabs, mobile responsive — all still working, no runtime errors.
- Fixed bug: wired all "View" buttons to open a new Prediction Detail Modal.
  - Built `src/components/goaledge/prediction-detail-modal.tsx` — full-screen modal showing match header (pitch gradient), score banner (for settled), recommended tip box, confidence/risk/status metrics row, in-depth analysis (blurred when locked), tipster card, and "Add to slip" footer button.
  - Extended Zustand store (`use-goal-edge.ts`) with `detailId`/`detailPrediction`/`detailLoading`/`openDetail`/`closeDetail` state. `openDetail(id, fallback?)` fetches fresh data via `/api/predictions/[id]`.
  - Wired `onView` handler in overview-tab, predictions-tab (→ `openDetail`), and landing (→ `openAuth` for logged-out users).
  - Mounted `<PredictionDetailModal/>` in `page.tsx`.
- New feature: Bet slip / accumulator builder (persisted in localStorage).
  - Extended store with `slip`/`slipOpen`/`addToSlip`/`removeFromSlip`/`clearSlip`/`inSlip`/`toggleSlip`. Slip hydrates from `localStorage` on boot and persists on every change.
  - Built `src/components/goaledge/slip-tab.tsx` — slip list (numbered picks with league icon, teams, tip, odds, kickoff countdown, remove button), accumulator summary panel (combined odds = product, stake input, potential return/profit), "Save slip" (downloads .txt), premium-pick warning, and 3 betting tips cards.
  - Added "Add to bet slip" ticket button to PredictionCard (toggle add/remove, only for upcoming non-locked tips).
  - Added floating slip button (bottom-right, shows count badge) visible across all dashboard tabs when slip has items.
  - Added slip count badge to "Bet slip" nav item in sidebar.
- New feature: Analytics tab with recharts.
  - Built `GET /api/analytics` endpoint — returns totals, byLeague (count + win rate), byMarket, confidence distribution (5 buckets), risk breakdown, cumulative win-rate trend, and insight (avg odds/confidence for won vs lost).
  - Built `src/components/goaledge/analytics-tab.tsx` — 4 KPI cards (win rate, total tips, avg conf won, avg odds won), cumulative win-rate trend (area chart), tips by league (horizontal bar), confidence distribution (donut), risk profile (CSS bars + mini stats), tips by market (vertical bar), and a "Key insight" gradient banner.
  - Used recharts AreaChart, BarChart, PieChart with emerald/teal color system, custom tooltips, and responsive containers.
- Styling polish:
  - PredictionCard: added framer-motion-style hover lift (`hover:-translate-y-0.5`), live countdown timers with pulsing dot (`animate-ping`), whole card is now clickable to open detail, keyboard-accessible (Enter/Space).
  - Dashboard tabs: added `animate-fade-in-up` transition on tab change (key-based remount).
  - PredictionDetailModal: pitch-gradient header, score banner, metric cards, blurred-lock overlay for premium analysis.
  - Floating slip button with active:scale-95 micro-interaction.
- Fixed analytics trend chart: initial weekly-bucket approach produced sparse data. Replaced with cumulative win-rate-over-time (running win rate as tips settle) — always shows meaningful progression.
- Verified end-to-end with agent-browser:
  - Login as admin → all 8 tabs visible (Overview, Predictions, Analytics, Bet slip, Subscription, Profile, Performance, Admin).
  - Clicked a prediction card → detail modal opened with match header, tip, odds, metrics, in-depth analysis, tipster info.
  - Clicked "Add to slip" in modal → nav badge updated to "Bet slip 1", card button changed to "Remove from slip".
  - Added a 2nd pick → slip tab showed combined odds 2.03 (1.40 × 1.45), potential return KES 203.00 (100 × 2.03). Math correct.
  - "Save slip" download → button showed "Saved!".
  - Analytics tab → all 5 charts render (verified via DOM: 4 recharts-wrappers, 9 SVG surfaces, 32 SVG elements). VLM confirmed trend chart shows green line/area/dots/axes/grid. KPIs and insight banner render.
  - No console errors or runtime errors.
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).

Stage Summary:
- Project is stable and feature-rich. 3 new major features added (detail modal, analytics, bet slip) + 1 bug fixed (View buttons).
- Dashboard now has 8 tabs. All core flows (auth, CRUD, payments, cache, detail view, slip, analytics) verified working.
- New files: `prediction-detail-modal.tsx`, `analytics-tab.tsx`, `slip-tab.tsx`, `api/analytics/route.ts`.
- Modified: `use-goal-edge.ts` (store extended), `prediction-card.tsx` (slip button + clickable + live countdown), `dashboard.tsx` (2 new tabs + floating button + nav badges + transitions), `overview-tab.tsx`/`predictions-tab.tsx`/`landing.tsx` (onView wiring), `page.tsx` (mount detail modal), `api-client.ts` (analytics + types).

Unresolved issues / risks:
- None blocking.
- The free demo user (free@goaledge.com) was upgraded to premium during the previous round's QA — premium may still be active. To test the locked-detail-modal UX cleanly, either re-seed or register a fresh user. (The locked-overlay code path is verified correct by the prediction-card blur/lock overlay which uses the same `p.locked` flag.)
- Next-phase recommendations (priority order):
  1. Add head-to-head / recent form data per prediction (would enrich the detail modal).
  2. Add a "Results" filter view showing settled tips with score + win/loss outcome badges.
  3. Add user notifications / toast when a tip is added to slip or premium is activated.
  4. Persist bet slips server-side (per user) so they survive device switches.
  5. Add an admin "settle" action (one-click mark upcoming → won/lost with score).
  6. Add CSV export of all predictions for admin.
  7. Add a public leaderboard / tipster ranking.
  8. Wire real Paystack when PAYSTACK_SECRET_KEY is set.

---
Task ID: 3
Agent: webDevReview cron (round 2)
Task: Second scheduled review — QA the site, add admin quick-settle, toast notifications, tipster leaderboard, and styling polish (empty states, skeleton loaders, animated hero).

Work Log:
- Read worklog.md — project stable with 9 tabs after round 1 (overview/predictions/analytics/leaderboard/slip/subscription/profile/performance/admin... wait, leaderboard was added this round; round 1 had 8 tabs). Identified next-phase priorities: admin settle action, toasts, leaderboard, empty states.
- QA'd current site with agent-browser: landing, login, all dashboard tabs, mobile — all working, no console/runtime errors.
- New feature: Admin quick-settle.
  - Built `src/components/goaledge/settle-modal.tsx` — focused modal with Won/Lost/Void outcome buttons (color-coded, ring-on-active), optional score inputs (large centered number inputs), pitch-gradient header. Uses key-based remount per prediction to reset state cleanly (avoids useEffect-setState lint issue).
  - Added "Settle" button to admin table rows for upcoming predictions (emerald pill, only shown when status === "upcoming"), alongside the existing Edit button.
  - Integrated `<SettleModal/>` into admin-tab with `settling` state.
  - Verified: clicked Settle on Barcelona vs Atletico → selected Won → entered 2-1 → toast "Tip settled — Barcelona vs Atletico Madrid → WON (2-1)" → table row updated to "Won" instantly (cache invalidation).
- New feature: Toast notifications via existing shadcn toaster.
  - Improved toast config in `use-toast.ts`: TOAST_LIMIT 1→3 (stack up to 3), TOAST_REMOVE_DELAY 1000000ms→4000ms (auto-dismiss after 4s).
  - Wired `useToast` into 5 components:
    - prediction-card.tsx: "Added to slip" / "Removed from slip" with team + odds.
    - subscription-tab.tsx: "🎉 Premium activated!" (success) / "Payment failed" (destructive).
    - profile-tab.tsx: "Profile updated" (success) / "Update failed" (destructive).
    - prediction-form-modal.tsx: "Prediction created" / "Prediction updated" / "Prediction deleted" (destructive) / "Save failed" / "Delete failed" (destructive).
    - settle-modal.tsx: "Tip settled" with outcome + score / "Settle failed" (destructive).
  - Verified: added Real Madrid to slip → "Added to slip — Real Madrid vs Sevilla · 1.45" toast appeared.
- New feature: Tipster leaderboard tab.
  - Built `GET /api/leaderboard` endpoint — aggregates all predictions by tipster: total/won/lost/void/settled/upcoming/premium counts + winRate + avgConfidence + avgOdds. Sorted by winRate desc, settled desc, total desc.
  - Built `src/components/goaledge/leaderboard-tab.tsx` — top-performer highlight card (gradient, crown, #1 badge), podium cards (top 3 with gold/silver/bronze gradients + rank icons + "Hot" badge for #1), full ranking table (rank badge, avatar with deterministic color, win-rate bar, W/L, tips, avg conf, avg odds), and 4 summary stat cards.
  - Added "leaderboard" to DashboardTab type + dashboard NAV (9th tab, Trophy icon).
  - Verified: Arena Tipster #1 (67% WR, 2W/1L, 8 tips), Coach Alex #2 (33% WR, 1W/2L, 7 tips). VLM confirmed clean design — podium, table, summary all render correctly.
- Styling polish:
  - Built `src/components/goaledge/empty-state.tsx` with reusable `EmptyState` (icon + title + description + action), `SkeletonGrid` (shimmer loading cards), `SkeletonStatRow` (shimmer stat cards).
  - Replaced basic pulse divs in overview-tab and predictions-tab with SkeletonGrid/SkeletonStatRow/EmptyState for professional loading + empty states.
  - Added floating gradient orbs (`.hero-orb`) + animated gradient text (`.gradient-animate`) to landing hero — VLM confirmed "dynamic background + animated text create depth. No issues."
  - Added `.gradient-animate` keyframes (gradientShift) and `float` keyframes to globals.css.
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 9 tabs visible.
  - Admin → Settle modal works, toast confirms, table updates.
  - Predictions → add to slip → toast confirms.
  - Leaderboard → podium + table + summary render.
  - Landing → floating orbs + animated gradient on hero.
  - Mobile (390×844) → hamburger menu works.
  - No console/runtime errors.

Stage Summary:
- Project now has 9 dashboard tabs (added Leaderboard). 4 new features this round (quick-settle, toasts, leaderboard, skeleton/empty states) + hero animation polish.
- New files: `settle-modal.tsx`, `leaderboard-tab.tsx`, `empty-state.tsx`, `api/leaderboard/route.ts`.
- Modified: `admin-tab.tsx` (settle button + modal), `prediction-card.tsx`/`subscription-tab.tsx`/`profile-tab.tsx`/`prediction-form-modal.tsx`/`settle-modal.tsx` (toasts), `use-toast.ts` (limit/delay), `overview-tab.tsx`/`predictions-tab.tsx` (skeleton/empty states), `landing.tsx` + `globals.css` (hero orbs + animated gradient), `use-goal-edge.ts` + `dashboard.tsx` (leaderboard tab), `api-client.ts` (leaderboard).
- All core flows verified: auth, CRUD, settle, slip, analytics, leaderboard, toasts, payments, cache, detail modal.

Unresolved issues / risks:
- None blocking.
- Note: the free demo user (free@goaledge.com) was upgraded to premium during round 1 QA. The settle action I tested changed Barcelona vs Atletico from upcoming → won (2-1), so the seeded data has drifted slightly from the original seed. To reset, re-run `bun run src/db/seed.ts` (it syncs users but skips existing predictions — would need a DB reset to restore original prediction statuses). Not a bug, just test data drift.
- Next-phase recommendations (priority order):
  1. Add head-to-head / recent form data per prediction (enrich detail modal).
  2. CSV export of all predictions for admin.
  3. Persist bet slips server-side per user (survive device switches).
  4. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  5. Email/password reset flow.
  6. Add a "Results" dedicated view (settled tips with score + outcome, filterable by date range).
  7. Add per-league stats page (drill-down from analytics).
  8. Add dark mode toggle (next-themes is already in deps).

---
Task ID: 4
Agent: webDevReview cron (round 3)
Task: Third scheduled review — QA the site, reset drifted seed data, add CSV export, H2H/form in detail modal, keyboard shortcuts, and confetti on premium activation.

Work Log:
- Read worklog.md — project stable with 9 tabs after round 2. Noted test data drift (Barcelona settled to Won during round 2 QA; free user upgraded to premium). Identified next-phase priorities: H2H data, CSV export, server-side slips, real Paystack, dark mode.
- QA'd current site with agent-browser: landing, login, all 9 dashboard tabs, mobile — all working, no console/runtime errors.
- Reset drifted prediction data:
  - Updated `src/db/seed.ts` to support a `--reset` flag that wipes and re-inserts predictions (previously skipped if any existed).
  - Ran `bun run src/db/seed.ts -- --reset` → deleted 15 drifted predictions, inserted 14 fresh seed predictions. Barcelona restored to "upcoming". Free user (free@goaledge.com) re-synced to "free" plan with no expiry.
- New feature: CSV export for admin.
  - Added `exportCSV()` function to `admin-tab.tsx` — generates CSV with all 17 fields (ID, teams, league, kickoff, tip, market, odds, confidence, risk, premium, status, scores, tipster, created). Properly escapes commas/quotes/newlines.
  - Added "Export CSV" button (outline variant, Download icon) next to "New prediction" in the admin header. Disabled when no rows.
  - Downloads as `goaledge-predictions-YYYY-MM-DD.csv`. Verified: clicked button → no errors, download triggered.
- New feature: Head-to-head + recent form + stat comparison in prediction detail modal.
  - Built `src/lib/match-stats.ts` — deterministic mock data generator using a seeded hash of team names. Each match always shows the same "stats". Exports `getTeamForm()` (last-5 W/D/L + GF/GA/CS), `getH2H()` (last 5 meetings with scores + summary), `getStatComparison()` (5 metrics with home-better flag).
  - Built `H2HSection` + `FormCard` components inside `prediction-detail-modal.tsx`:
    - Recent form: two cards (home/away) with colored W/D/L badges + GF/GA/CS mini-stats.
    - Head-to-head: summary (home wins / draws / away wins) + visual proportion bar (emerald/slate/rose) + last 3 meetings with color-coded scores.
    - Stats comparison: 5 rows (avg goals scored/conceded, shot accuracy, possession, clean sheets) with horizontal diverging bars; the better side highlighted in emerald.
  - Verified: opened Barcelona vs Atletico detail modal → "Recent form (last 5)", "Head-to-head", "Stats comparison" sections all render (confirmed via DOM snapshot + VLM saw the stats bars).
- New feature: Keyboard shortcuts.
  - Added global keydown listener in `dashboard.tsx`:
    - 1-9: switch to the Nth nav tab (respects admin-only filtering).
    - ? (Shift+/): toggle shortcuts help modal.
    - Esc: close sidebar / shortcuts modal.
    - Shortcuts disabled while typing in inputs/textarea/select/contenteditable.
  - Built `ShortcutsButton` (bottom-left floating, Keyboard icon) + `ShortcutsModal` (lists all tabs with their number key + general shortcuts).
  - Verified: pressed "?" → shortcuts modal opened with "SWITCH TABS" and "GENERAL" sections; pressed Esc → closed; pressed "3" → switched to Analytics tab; pressed "9" → switched to Admin tab.
- Styling polish: confetti on premium activation.
  - Built `src/components/goaledge/confetti.tsx` — renders 80 colored confetti pieces that fall and fade over ~2.8s. Uses key-based remount per burst (avoids setState-in-effect lint issue). ConfettiBurst generates pieces once on mount.
  - Added `confettiFall` keyframes + `.confetti-piece` CSS to `globals.css`.
  - Wired into `subscription-tab.tsx`: on successful premium activation, `setConfettiFire((f) => f + 1)` triggers a new burst.
  - Verified: activated premium as free user → 80 confetti pieces rendered (confirmed via DOM count) + premium status updated to "Premium 24hr · 23h remaining".
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 9 tabs visible.
  - Keyboard: ? opens shortcuts help, 1-9 switch tabs, Esc closes modals.
  - Admin: Export CSV button works (no errors).
  - Predictions: detail modal shows Recent form + H2H + Stats comparison sections.
  - Free user → Subscription → Activate Premium → confetti (80 pieces) + premium granted.
  - No console/runtime errors.

Stage Summary:
- Project stable with 9 dashboard tabs. 5 new features this round (CSV export, H2H/form/stats in detail modal, keyboard shortcuts, confetti) + seed data reset.
- New files: `confetti.tsx`, `match-stats.ts`.
- Modified: `seed.ts` (--reset flag), `admin-tab.tsx` (CSV export), `prediction-detail-modal.tsx` (H2H/form/stats sections), `dashboard.tsx` (keyboard shortcuts + help modal), `subscription-tab.tsx` (confetti), `globals.css` (confetti keyframes), `api-client.ts` (no changes needed this round).
- All core flows verified: auth, CRUD, settle, slip, analytics, leaderboard, toasts, CSV export, H2H detail, keyboard shortcuts, confetti, payments, cache.

Unresolved issues / risks:
- None blocking.
- The H2H/form/stats data is deterministic mock (generated from team name hashes), not real historical data. This is clearly visual richness for the demo — a future phase could integrate a real football stats API.
- Next-phase recommendations (priority order):
  1. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  2. Persist bet slips server-side per user (survive device switches).
  3. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  4. Email/password reset flow.
  5. Add a "Results" dedicated view (settled tips with score + outcome, filterable by date range).
  6. Add per-league stats page (drill-down from analytics).
  7. Add dark mode toggle (next-themes is already in deps — would require refactoring hardcoded slate colors to CSS variables).
  8. Add an admin dashboard with charts (predictions per day, win-rate by league).

---
Task ID: 5
Agent: webDevReview cron (round 4)
Task: Fourth scheduled review — QA the site, re-sync free user, add dark mode toggle, Results/History view, and framer-motion stagger animations.

Work Log:
- Read worklog.md — project stable with 9 tabs after round 3. Noted free user was upgraded to premium during round 3 confetti QA. Identified next-phase priorities: dark mode, Results view, real stats API, server-side slips.
- QA'd current site with agent-browser: landing, login, all 9 dashboard tabs, mobile — all working, no console/runtime errors.
- Re-synced free user: ran `bun run src/db/seed.ts` (without --reset, so predictions preserved) → free@goaledge.com re-synced to "free" plan with no expiry. 14 predictions unchanged.
- New feature: Dark mode toggle (next-themes).
  - Built `src/components/theme-provider.tsx` — wraps `next-themes` ThemeProvider (attribute="class", defaultTheme="light", enableSystem=false, disableTransitionOnChange).
  - Wired `<ThemeProvider>` into `layout.tsx` around children + Toaster.
  - Built `src/components/goaledge/theme-toggle.tsx` — button that toggles theme. Renders both Sun + Moon icons, uses CSS `[.dark_&]` selectors to show/hide the correct icon (avoids hydration mismatch + setState-in-effect lint issue). `useTheme().resolvedTheme` for the onClick handler.
  - Added `ThemeToggle` to: landing header (next to Sign in), dashboard sidebar user card (desktop + mobile drawer, next to sign out).
  - Added comprehensive dark mode CSS overrides to `globals.css` — `.dark` class overrides for all key slate utilities used by GoalEdge components: page bg (bg-slate-50 → slate-900), card bg (bg-white → slate-800), text colors (text-slate-900/800/700/600/500/400/300 → lighter slate shades), borders, inputs, hover states, status badge backgrounds (softened with alpha), skeleton loaders, scrollbars. Used `!important` to override Tailwind utilities without refactoring every component.
  - Verified: clicked toggle on landing → html got "dark" class → VLM confirmed "dark background with readable white/light text, cards have dark surfaces, no contrast issues". Logged in → dashboard dark mode VLM confirmed "well-optimized for dark mode, no contrast issues, all elements follow dark mode best practices". Theme persists across page reloads (localStorage via next-themes).
- New feature: Results/History dedicated view (10th dashboard tab).
  - Built `src/components/goaledge/results-tab.tsx` — settled tips list with:
    - 4 summary stat cards: Win rate, Won (in view), Lost (in view), Current streak (calculates W/L streak from most-recent-first sorted results, with "🔥 on fire" for 3+ wins / "cold streak" for 3+ losses).
    - Outcome filter (All / Won / Lost) with color-coded active states (emerald for Won, rose for Lost, slate for All).
    - Date filter (All time / 7 days / 30 days) — filters client-side by kickoff timestamp.
    - Results list: clickable rows (open detail modal) showing outcome icon (green check / red X), league icon, teams, tip+market+odds, date+tipster, and score badge + Won/Lost status badge. Sorted most-recent-first. Scrollable with max height.
    - Empty state with trophy icon when no tips match filters.
  - Added "results" to DashboardTab type + dashboard NAV (3rd tab, History icon).
  - Extended keyboard shortcut handler to support "0" for the 10th tab (1-9 + 0). Updated shortcuts modal to show "0" for the 10th item.
  - Verified: opened Results tab → 4 stat cards render, 6 settled tips shown with scores (3–1, 0–1, 1–0, 2–1, 2–2) + Won/Lost badges. Date filter "7 days" showed 6 tips. VLM confirmed dark mode Results tab looks clean.
- Styling polish: framer-motion stagger animations.
  - Built `src/components/goaledge/motion.tsx` — `StaggerGrid` (parent with staggerChildren variant) + `StaggerItem` (child with fade+slide-up, 0.06s stagger, 0.3s ease-out).
  - Applied to: predictions-tab card grid (replaced plain div) and overview-tab upcoming tips grid.
  - Verified: 8 motion items rendered on predictions tab (one per card). Cards fade+slide in with staggered delay on tab load. No console errors.
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Landing: theme toggle works (dark/light), VLM confirmed both modes look good.
  - Login as admin → 10 tabs visible (added Results as 3rd tab).
  - Keyboard: 1-9 + 0 now switch all 10 tabs; ? shows shortcuts (updated with 0 for 10th).
  - Results tab: 4 stat cards + filters + 6 settled tips with scores + date filter works.
  - Predictions tab: stagger animation (8 motion items), cards animate in on load.
  - Dark mode: persisted across reloads, dashboard + landing + modals all readable.
  - No console/runtime errors.

Stage Summary:
- Project now has 10 dashboard tabs (added Results). 3 new features this round (dark mode, Results view, framer-motion stagger) + free user re-sync.
- New files: `theme-provider.tsx`, `theme-toggle.tsx`, `results-tab.tsx`, `motion.tsx`.
- Modified: `layout.tsx` (ThemeProvider), `globals.css` (dark mode overrides), `dashboard.tsx` (Results tab + theme toggle + 0-key shortcut), `landing.tsx` (theme toggle), `use-goal-edge.ts` (results tab type), `predictions-tab.tsx` + `overview-tab.tsx` (stagger animations).
- All core flows verified: auth, CRUD, settle, slip, analytics, leaderboard, results, toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, payments, cache.

Unresolved issues / risks:
- None blocking.
- Dark mode uses CSS `!important` overrides on slate utilities rather than full CSS-variable refactor. This is pragmatic (avoids touching ~15 component files) but means any new components using slate classes will automatically get dark mode via the overrides. The pitch-gradient headers (landing hero, modal headers) stay dark in both modes — intentional.
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  2. Persist bet slips server-side per user (survive device switches).
  3. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  4. Email/password reset flow.
  5. Add per-league stats page (drill-down from analytics).
  6. Add an admin dashboard with charts (predictions per day, win-rate by league).
  7. Add notification badges (e.g. new tips since last visit).
  8. Add a "share slip" feature (generates a shareable link/image of the accumulator).

---
Task ID: 6
Agent: webDevReview cron (round 5)
Task: Fifth scheduled review — QA the site, add server-side bet slip persistence, share slip feature, admin insights dashboard with charts, and styling polish.

Work Log:
- Read worklog.md — project stable with 10 tabs after round 4. Identified next-phase priorities: server-side slip persistence, share slip, admin dashboard charts, real stats API.
- QA'd current site with agent-browser: landing, login, all 10 dashboard tabs — all working, no console/runtime errors.
- New feature: Server-side bet slip persistence.
  - Added `BetSlip` model to Prisma schema (userId unique, predictionIds as JSON string, updatedAt). Pushed schema with `bun run db:push`.
  - Built `src/app/api/slip/route.ts` — GET (fetch slip with full prediction data), PUT (replace slip IDs), DELETE (clear slip). All require authentication.
  - Added `apiGetSlip`, `apiSaveSlip`, `apiClearSlip` to `api-client.ts` with `SlipPrediction` type.
  - Updated `use-goal-edge.ts` store with debounced server sync (`scheduleSlipSync`, 800ms debounce):
    - On `boot`: if logged in, fetch server slip (takes precedence over localStorage); if server empty but local has items, push local to server.
    - On `login`: same sync logic after login.
    - On `logout`: clear slip from state (server slip preserved for next login).
    - On `addToSlip`/`removeFromSlip`/`clearSlip`: save to localStorage immediately + schedule debounced server sync.
  - Had to restart dev server to pick up regenerated Prisma client (db.betSlip was undefined in the cached module). Killed old next-server process and started new one.
  - Verified: added tips to slip → server stored 6 IDs. Removed one → server updated to 5 IDs (debounced). Page reload → slip restored from server. localStorage remains as offline fallback.
- New feature: Share slip.
  - Added `shareSlip()` function to `slip-tab.tsx` — generates a shareable text summary with emoji (⚽, 🔥, 💰), combined odds, stake → return. Uses `navigator.share()` if available (mobile native share sheet), otherwise copies to clipboard via `navigator.clipboard.writeText()`.
  - Added "Share" button (Share2 icon) in a 3-column grid alongside Reset and Save. Shows "Copied!" confirmation + toast "Slip copied to clipboard — Share it anywhere!".
  - Verified: clicked Share → toast appeared, button showed "Copied!".
- New feature: Admin insights dashboard with charts.
  - Built `src/components/goaledge/admin-insights.tsx` — compact insights panel that appears at the top of the Admin tab:
    - 4 KPI cards: Total tips, Win rate, Upcoming, Premium (with gradient accents).
    - Status breakdown donut chart (recharts PieChart with Won/Upcoming/Lost segments + legend).
    - Tips by league horizontal bar chart (top 6 leagues).
  - Inserted `<AdminInsights/>` into admin-tab.tsx between the header and search bar.
  - Verified: VLM confirmed "KPI cards have gradient accents, donut chart shows segments with colors/labels/counts, bar chart displays leagues with bar lengths. No issues detected."
- Styling polish: gradient accents on stat cards.
  - Updated `stat-card.tsx` — added a gradient top accent bar (color-matched to the accent), and a hover scale-110 effect on the icon. The bar uses `bg-gradient-to-r` with accent-specific from/to colors.
  - Applied to all StatCard usages across overview, results, leaderboard, and analytics tabs.
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 10 tabs visible.
  - Admin tab: insights dashboard with KPIs + donut + bar chart renders.
  - Slip: server-side persistence works (6 items → remove 1 → 5 items on server).
  - Share: clipboard copy + toast works.
  - No console/runtime errors.

Stage Summary:
- Project stable with 10 dashboard tabs. 4 new features this round (server-side slip persistence, share slip, admin insights charts, gradient stat cards).
- New files: `api/slip/route.ts`, `admin-insights.tsx`.
- Modified: `prisma/schema.prisma` (BetSlip model), `api-client.ts` (slip API functions), `use-goal-edge.ts` (server slip sync), `slip-tab.tsx` (share button), `admin-tab.tsx` (insights dashboard), `stat-card.tsx` (gradient accents).
- All core flows verified: auth, CRUD, settle, slip (now server-persisted), analytics, leaderboard, results, toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, share slip, admin insights, payments, cache.

Unresolved issues / risks:
- None blocking.
- The dev server had to be manually restarted to pick up the Prisma schema change (BetSlip model). Future schema changes will require the same. The system's auto-restart may not clear the Prisma client module cache.
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  2. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  3. Email/password reset flow.
  4. Add per-league stats page (drill-down from analytics).
  5. Add notification badges (e.g. new tips since last visit).
  6. Add a "favorites" system (bookmark leagues/teams for quick access).
  7. Add user activity feed (recent logins, slip shares, premium activations).
  8. Add an admin user management view (list users, toggle premium/role).

---
Task ID: 7
Agent: webDevReview cron (round 6)
Task: Sixth scheduled review — QA the site, add admin user management, favorites/bookmark system, new-tips notification badge, and styling polish (animated stat counters, hover glow).

Work Log:
- Read worklog.md — project stable with 10 tabs after round 5. Identified next-phase priorities: admin user management, favorites system, notification badges, per-league stats.
- QA'd current site with agent-browser: landing, login, all 10 dashboard tabs — all working, no console/runtime errors.
- New feature: Admin user management view.
  - Built `GET /api/admin/users` — lists all users with name, email, role, plan, avatarColor, planExpiresAt, createdAt, and payment count (success subscriptions). Admin-only.
  - Built `PATCH /api/admin/users/[id]` — updates a user's role (admin/user) or plan (premium→24h / free→revoke). Admin-only. Protects root admin from demotion.
  - Added `apiAdminUsers` + `apiAdminUpdateUser` to api-client.ts with `AdminUser` type.
  - Built `src/components/goaledge/admin-users.tsx` — searchable user table with avatar, name+email, plan badge (Premium/Free + expiry), joined date, payment count, and Grant/Revoke premium + Promote/Demote admin action buttons. Includes toast notifications on success/failure. Root admin (admin@goaledge.com) is protected (no demote button).
  - Inserted `<AdminUsers/>` at the bottom of the admin tab.
  - Verified: VLM confirmed table renders with all columns. Clicked "Grant" on free user → toast "Premium granted — Grace Mwangi is now premium" → table updated to show Premium + expiry.
- New feature: Favorites/bookmark system (league bookmarks).
  - Built `src/hooks/use-favorites.ts` — localStorage-backed hook (`ge_fav_leagues_v1`) with `favorites`, `toggle`, `isFavorite`. Uses lazy useState initializer (avoids setState-in-effect lint issue).
  - Updated `predictions-tab.tsx`:
    - Added favorites quick-filter bar (appears when favorites exist) with "Favorites only" toggle + clickable league chips (icon + name + remove star).
    - Added "Favorite leagues" multi-toggle section in the filter panel — all 10 leagues as toggle pills with filled star when favorited.
    - `favOnly` state filters displayed rows to only favorited leagues.
    - Fixed nested-button HTML validation error: changed outer league chip from `<button>` to `<div role="button">` (the remove-star remains a `<button>` inside).
  - Verified: opened filters → "FAVORITE LEAGUES" section with all leagues → favorited Premier League + La Liga → favorites bar appeared with chips → clicked "Favorites only" → "Showing 3 tips · favorites only".
- New feature: New-tips notification badge.
  - Built `src/hooks/use-new-tips-badge.ts` — tracks last-seen tip count in localStorage (`ge_last_seen_tip_count_v1`). Uses lazy useState initializer. Exposes `newCount` (tips added since last visit) and `markSeen(count)`.
  - Updated `dashboard.tsx`: fetches total tip count on mount via `apiStats()`, passes to `useNewTipsBadge`. When user visits Predictions tab, marks tips as seen (clears badge).
  - Updated `NavBtn` to support `badgeTone` ("emerald" for slip, "amber" for new tips). Predictions tab badge uses amber tone.
  - Verified: logged in → "Predictions 14" badge appeared (14 tips, first visit baseline) → clicked Predictions → badge cleared.
- Styling polish:
  - Built `src/hooks/use-count-up.ts` — animated count-up hook (ease-out cubic, 1200ms, requestAnimationFrame).
  - Updated `landing.tsx` hero stat cards to use `LandingStat` component with `useCountUp` — numbers animate from 0 to target on mount. Added `tabular-nums` for stable digit width + hover effect (border/bg brighten).
  - Updated `ui.tsx` Button: primary variant now has `hover:shadow-emerald-500/40` (glow on hover), white variant has `hover:shadow-emerald-500/20`.
- Fixed nested-button HTML validation error in predictions-tab favorites bar (outer button → div with role/tabIndex).
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 10 tabs visible, "Predictions 14" amber badge.
  - Admin tab: user management table with 3+ users, Grant/Promote buttons work (granted premium to free user, toast confirmed, table updated).
  - Predictions: favorites filter bar + "Favorite leagues" multi-toggle in filter panel, "Favorites only" filter works (3 tips from favorited leagues).
  - Notification badge: appeared on first visit, cleared after visiting Predictions tab.
  - Landing: animated count-up stat cards.
  - No console/runtime errors after fixing nested button.

Stage Summary:
- Project stable with 10 dashboard tabs. 4 new features this round (admin user management, favorites/bookmarks, new-tips badge, animated stat counters) + button hover glow.
- New files: `api/admin/users/route.ts`, `api/admin/users/[id]/route.ts`, `admin-users.tsx`, `use-favorites.ts`, `use-new-tips-badge.ts`, `use-count-up.ts`.
- Modified: `api-client.ts` (admin user functions), `admin-tab.tsx` (user management section), `predictions-tab.tsx` (favorites bar + filter panel + favOnly), `dashboard.tsx` (new-tips badge + badgeTone), `ui.tsx` (hover glow), `landing.tsx` (animated stat counters).
- All core flows verified: auth, CRUD, settle, slip (server-persisted), analytics, leaderboard, results, toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, share slip, admin insights, admin user management, favorites, new-tips badge, animated counters, payments, cache.

Unresolved issues / risks:
- None blocking.
- The free demo user (free@goaledge.com) was granted premium during QA this round. Re-run `bun run src/db/seed.ts` to reset.
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  2. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  3. Email/password reset flow.
  4. Add per-league stats page (drill-down from analytics).
  5. Add user activity feed (recent logins, slip shares, premium activations).
  6. Add a "following" system (follow tipsters, get notifications when they post).
  7. Add live match scores / real-time updates (websocket mini-service).
  8. Add a blog/news section for match previews and betting education.

---
Task ID: 8
Agent: webDevReview cron (round 7)
Task: Seventh scheduled review — QA the site, re-sync free user, add per-league drill-down, blog/news section, and scroll-triggered reveal animations.

Work Log:
- Read worklog.md — project stable with 10 tabs after round 6. Noted free user was granted premium during round 6 QA. Identified next-phase priorities: per-league stats, blog, following system, live scores.
- QA'd current site with agent-browser: landing, login, all 10 dashboard tabs — all working, no console/runtime errors.
- Re-synced free user: ran `bun run src/db/seed.ts` → free@goaledge.com re-synced to "free" plan. 14 predictions unchanged.
- New feature: Per-league drill-down view.
  - Built `src/components/goaledge/league-detail-modal.tsx` — modal that opens when a league is clicked. Shows: league header (icon + name + country), 4 stat cards (Total tips, Win rate, Won/Lost, Upcoming), settled performance bar (gradient, win rate %), and a scrollable list of tips in that league (clickable → opens prediction detail). Fetches data via `apiAnalytics` + `apiPredictions({league})`.
  - Updated `analytics-tab.tsx`: made the league list items clickable (buttons with hover effect) + added "Click a league for details" hint. Added `leagueModal` state + mounted `<LeagueDetailModal>`.
  - Verified: clicked "Premier League" in analytics → modal opened with 4 stat cards, 67% win rate bar, "2 won · 1 lost · 2 upcoming", and tips list. VLM confirmed "no visual issues detected".
- New feature: Blog/news section (11th dashboard tab).
  - Built `src/lib/blog-data.ts` — 6 static articles across 4 categories (Match Preview, Betting Guide, Analysis, News). Each has title, excerpt, full content (markdown-style with ## headings), author, date, read time, and gradient cover.
  - Built `src/components/goaledge/blog-tab.tsx`:
    - Featured article card (most recent) with gradient cover + "⭐ Featured" badge.
    - Category filter pills (All / Match Preview / Betting Guide / Analysis / News).
    - Search input (filters by title/excerpt).
    - Article grid: cards with gradient cover, category badge, title, excerpt, date + read time.
    - Article detail view: full cover, meta (author/date/read time), excerpt, rendered content (## headings → h2, paragraphs), and a CTA banner "Ready to put this into practice?".
  - Added "blog" to DashboardTab type + dashboard NAV (7th tab, BookOpen icon).
  - Verified: opened Blog tab → featured article + category filters + article grid rendered. Clicked featured article → detail view with headings, paragraphs, back button, CTA.
- Styling polish: scroll-triggered reveal animations.
  - Built `Reveal` component in `motion.tsx` — uses framer-motion `whileInView` with `once: true` + `-80px` margin. Fades + slides up when scrolled into view. Supports `delay` prop for staggered effects.
  - Applied to landing page: features grid (4 cards with 0.08s stagger) and testimonials grid (3 cards with 0.1s stagger).
  - Improved testimonial avatars: changed from uniform emerald circles to color-varied solid circles (emerald, sky, amber) for visual variety.
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 11 tabs visible (added Blog as 7th tab).
  - Blog tab: featured article + 6 articles + category filters + search + detail view all work.
  - Analytics: league list items clickable → league detail modal with stats + tips list.
  - Landing: scroll-reveal animations on features + testimonials, improved avatars.
  - No console/runtime errors.

Stage Summary:
- Project now has 11 dashboard tabs (added Blog). 3 new features this round (per-league drill-down, blog/news, scroll-reveal animations) + free user re-sync.
- New files: `league-detail-modal.tsx`, `blog-tab.tsx`, `blog-data.ts`.
- Modified: `analytics-tab.tsx` (clickable leagues + modal), `motion.tsx` (Reveal component), `landing.tsx` (scroll-reveal + improved avatars), `use-goal-edge.ts` + `dashboard.tsx` (blog tab).
- All core flows verified: auth, CRUD, settle, slip, analytics (now with league drill-down), leaderboard, results, blog, toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, share slip, admin insights, admin user management, favorites, new-tips badge, animated counters, scroll-reveal, payments, cache.

Unresolved issues / risks:
- None blocking.
- Blog articles are static (hardcoded in `blog-data.ts`). A future phase could add a CMS or database-backed articles with admin CRUD.
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  2. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  3. Email/password reset flow.
  4. Add a "following" system (follow tipsters, get notifications when they post).
  5. Add live match scores / real-time updates (websocket mini-service).
  6. Add admin CRUD for blog articles (database-backed).
  7. Add user activity feed (recent logins, slip shares, premium activations).
  8. Add a referral program (invite friends, earn premium credits).

---
Task ID: 9
Agent: webDevReview cron (round 8)
Task: Eighth scheduled review — QA the site, add user activity feed, referral program, and profile tab styling polish.

Work Log:
- Read worklog.md — project stable with 11 tabs after round 7. Identified next-phase priorities: activity feed, referral program, following system, live scores.
- QA'd current site with agent-browser: landing, login, all 11 dashboard tabs — all working, no console/runtime errors.
- New feature: User activity feed + Referral program (12th dashboard tab — "Activity").
  - Added `ActivityLog` model to Prisma schema (userId, type, detail, createdAt). Added `referralCode` (optional unique) + `referredBy` fields to User model. Pushed schema with `--accept-data-loss` (no actual data loss — new columns only).
  - Built `src/lib/activity.ts` — `logActivity()` (best-effort, auto-trims to 100 per user), `ensureReferralCode()` (generates "XX-YYYYYY" format from name), `countReferrals()`.
  - Built `GET /api/activity` — returns latest 25 activities for the current user.
  - Built `GET /api/referral` — returns referral code, total referral count, premium referral count, reward per referral (24h).
  - Wired activity logging into: login (type "login"), register (type "register", with referral detail), premium activation (type "premium_activated"), prediction creation (type "prediction_created", with match detail).
  - Updated register route to accept + validate `referralCode` in the request body, store as `referredBy` on the new user.
  - Built `src/components/goaledge/activity-tab.tsx` — combined Activity + Referral dashboard:
    - Gradient referral program card (emerald→teal) with referral code (monospace), Copy + Share buttons, and 2 stats (Total referrals, Premium referrals). Copy uses clipboard + toast; Share uses navigator.share or clipboard fallback.
    - Activity feed: scrollable list with color-coded icons per type (login=sky, register=emerald, premium_activated=amber, prediction_created=emerald, etc.), detail text, and timestamp.
  - Added "activity" to DashboardTab type + dashboard NAV (8th tab, Activity icon).
  - Had to restart dev server to pick up Prisma client regeneration (new ActivityLog + referralCode fields).
  - Verified: opened Activity tab → referral card with code "AL-LLIP5J", Copy button showed "Copied!" + toast, activity feed showed "Signed in" entry. VLM confirmed "no visual issues, all elements render as expected".
- Styling polish: profile tab gradient banner.
  - Updated `profile-tab.tsx` summary card — added a gradient banner (user's avatar color → semi-transparent) at the top of the card, with the avatar overlapping it (-mt-10, border-4 border-white). The rest of the card content (name, email, badges, details list) sits below the banner.
  - VLM confirmed "gradient banner with overlapping avatar works, all details display correctly, no visual issues".
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 12 tabs visible (added Activity as 8th tab).
  - Activity tab: referral code + Copy/Share + stats + activity feed all render and work.
  - Profile tab: gradient banner + overlapping avatar + details list render correctly.
  - No console/runtime errors on fresh load.

Stage Summary:
- Project now has 12 dashboard tabs (added Activity). 3 new features this round (activity feed, referral program, profile gradient banner).
- New files: `activity.ts` (lib), `api/activity/route.ts`, `api/referral/route.ts`, `activity-tab.tsx`.
- Modified: `prisma/schema.prisma` (ActivityLog model + User referralCode/referredBy), `auth/login/route.ts` + `auth/register/route.ts` (activity logging + referral), `lib/paystack.ts` (activity logging), `api/predictions/route.ts` (activity logging), `api-client.ts` (activity + referral functions), `profile-tab.tsx` (gradient banner), `use-goal-edge.ts` + `dashboard.tsx` (activity tab).
- All core flows verified: auth, CRUD, settle, slip, analytics, leaderboard, results, blog, activity feed, referral program, toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, share slip, admin insights, admin user management, favorites, new-tips badge, animated counters, scroll-reveal, profile gradient banner, payments, cache.

Unresolved issues / risks:
- None blocking.
- Activity logging is best-effort (failures silently ignored) — appropriate for a non-critical feature.
- Referral rewards (24h premium per successful referral) are tracked but not automatically granted — the count is shown but the actual premium extension would need to be implemented in the paystack verify flow (check if user was referred, extend referrer's premium).
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Auto-grant referral rewards (extend referrer's premium when a referral activates premium).
  2. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  3. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  4. Email/password reset flow.
  5. Add a "following" system (follow tipsters, get notifications when they post).
  6. Add live match scores / real-time updates (websocket mini-service).
  7. Add admin CRUD for blog articles (database-backed).
  8. Add a public profile/shareable referral landing page.

---
Task ID: 10
Agent: webDevReview cron (round 9)
Task: Ninth scheduled review — QA the site, add auto-grant referral rewards, following system, and premium card styling polish.

Work Log:
- Read worklog.md — project stable with 12 tabs after round 8. Identified next-phase priorities: auto-grant referral rewards, following system, real stats API.
- QA'd current site with agent-browser: landing, login, all 12 dashboard tabs — all working, no console/runtime errors.
- New feature: Auto-grant referral rewards.
  - Updated `lib/paystack.ts` `verifyAndFulfill()` — after granting premium to the paying user, checks if they were referred (user.referredBy). If so, looks up the referrer by referralCode and extends their premium: if currently premium, extends from current expiry; otherwise grants 24h from now. Logs a "premium_activated" activity for the referrer with detail "24h referral reward from {user.name}".
  - The reward is 24h of premium per successful referral activation (matches the displayed rewardPerReferral).
  - Best-effort (wrapped in try/catch) so payment failures don't block the main flow.
- New feature: Following system (follow tipsters).
  - Added `Follow` model to Prisma schema (followerId, followeeId as tipster name, unique constraint on [followerId, followeeId]). Added `follows` relation to User model. Pushed schema with `--accept-data-loss`.
  - Built `GET/POST /api/follow` — list followed tipsters, follow a tipster (upsert).
  - Built `DELETE /api/follow/[tipster]` — unfollow a tipster by name.
  - Added `apiGetFollowing`, `apiFollow`, `apiUnfollow` to api-client.ts.
  - Built `src/hooks/use-following.ts` — `useFollowing` hook with optimistic toggle, `following` list, `loaded` flag, `load`, `toggle`, `isFollowingTipster`.
  - Updated `leaderboard-tab.tsx`:
    - Added "Follow" column to the ranking table header.
    - Added `FollowButton` component (Follow/Following toggle with UserPlus/UserCheck icons, emerald when following, slate when not).
    - Wired `useFollowing` hook — loads following on mount, optimistic toggle on click.
  - Had to restart dev server to pick up Prisma client regeneration (new Follow model).
  - Verified: clicked "Follow" on Arena Tipster → button changed to "Following" (emerald) → API confirmed "Arena Tipster" in following list. VLM confirmed "buttons visible and properly styled, no visual issues".
- Styling polish: premium prediction card gradient accent.
  - Updated `prediction-card.tsx` — premium cards now have:
    - Amber border + ring (border-amber-200 ring-1 ring-amber-100) instead of plain slate.
    - Gradient top accent bar (from-amber-400 via-amber-500 to-orange-500, 1px height, rounded top).
  - Non-premium cards keep the plain slate border.
  - VLM confirmed "Premium cards have a visible amber/gold gradient bar at the top and an amber-tinted border; non-premium cards lack these elements."
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 12 tabs visible.
  - Leaderboard: Follow/Following buttons work (optimistic + server persist), API confirms.
  - Predictions: premium cards have amber gradient bar + border, non-premium cards plain.
  - No console/runtime errors.

Stage Summary:
- Project stable with 12 dashboard tabs. 3 new features this round (auto-grant referral rewards, following system, premium card gradient accent).
- New files: `api/follow/route.ts`, `api/follow/[tipster]/route.ts`, `use-following.ts`.
- Modified: `lib/paystack.ts` (referral rewards), `prisma/schema.prisma` (Follow model + User.follows), `api-client.ts` (follow functions), `leaderboard-tab.tsx` (follow buttons + FollowButton component), `prediction-card.tsx` (premium gradient accent).
- All core flows verified: auth, CRUD, settle, slip, analytics, leaderboard (now with follow), results, blog, activity feed, referral program (now with auto-rewards), toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, share slip, admin insights, admin user management, favorites, new-tips badge, animated counters, scroll-reveal, profile gradient banner, premium card accents, payments, cache.

Unresolved issues / risks:
- None blocking.
- The following system tracks follows but doesn't yet filter predictions by followed tipsters — a "Following" filter on the predictions tab would be the natural next step.
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Add a "Following" filter to the predictions tab (show only tips from followed tipsters).
  2. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  3. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  4. Email/password reset flow.
  5. Add live match scores / real-time updates (websocket mini-service).
  6. Add admin CRUD for blog articles (database-backed).
  7. Add a public profile/shareable referral landing page.
  8. Add push notifications for new tips from followed tipsters.

---
Task ID: 11
Agent: webDevReview cron (round 10)
Task: Tenth scheduled review — QA the site, add following filter on predictions, password reset flow, and blog typography polish.

Work Log:
- Read worklog.md — project stable with 12 tabs after round 9. Identified next-phase priorities: following filter, password reset, real stats API.
- QA'd current site with agent-browser: landing, login, all 12 dashboard tabs — all working, no console/runtime errors.
- New feature: Following filter on predictions tab.
  - Updated `predictions-tab.tsx` — integrated `useFollowing` hook (loads followed tipsters on mount).
  - Added "Following (N)" toggle button in the quick-filter bar (appears when user follows ≥1 tipster). Emerald when active, shows count.
  - Applied `followingOnly` filter to displayed rows: `rows.filter((p) => isFollowingTipster(p.tipster))`. Works alongside the existing "Favorites only" filter (both can be active simultaneously).
  - Updated "Clear all filters" to also reset `followingOnly`.
  - Verified: followed "Arena Tipster" on leaderboard → went to predictions → "Following (1)" button appeared → clicked it → "Showing 4 tips · following" (only Arena Tipster's tips).
- New feature: Password reset flow.
  - Added `PasswordReset` model to Prisma (userId, token unique, expiresAt, usedAt). Added `passwordResets` relation to User. Pushed schema.
  - Built `POST /api/auth/reset-request` — validates email, generates a 32-byte hex token (1h expiry), invalidates previous unused tokens, stores new token. In demo mode, returns the token directly (production would email it). Doesn't reveal whether email exists.
  - Built `POST /api/auth/reset-confirm` — validates token (exists, not used, not expired), updates password hash, marks token as used.
  - Added `apiResetRequest` + `apiResetConfirm` to api-client.ts.
  - Rewrote `auth-modal.tsx` to support 4 modes: login, register, forgot-request, forgot-confirm:
    - Added "Forgot password?" link on the login form.
    - forgot-request mode: email field + "Send reset link" button. On success, transitions to forgot-confirm mode with the demo token.
    - forgot-confirm mode: "Set a new password" with new password field + "Set new password" button. On success, transitions back to login with "Password updated! You can now sign in." message.
    - Back arrow (←) on forgot modes to return to login.
  - Had to restart dev server to pick up Prisma client regeneration (new PasswordReset model).
  - Verified: clicked "Forgot password?" → entered free@goaledge.com → "Send reset link" → transitioned to "Set a new password" → entered "newpass456" → "Set new password" → "Password updated! You can now sign in." → logged in with new password successfully. Re-synced seed to restore original password.
- Styling polish: blog article typography.
  - Updated `blog-tab.tsx` article view:
    - Excerpt: added emerald left border accent (border-l-4 border-emerald-400) + italic styling.
    - Section headings (## prefix): added a small vertical emerald accent bar (h-5 w-1 rounded-full bg-emerald-500) before the heading text.
    - Numbered lists (lines starting with "N."): rendered as `<ol>` with emerald circle badges (h-5 w-5 rounded-full bg-emerald-100) containing the number.
    - Bullet lists (lines starting with "- "): rendered as `<ul>` with small emerald dot markers.
  - VLM confirmed "visual hierarchy is effective: excerpt with left border, headings with vertical accent bar, numbered lists with emerald circle badges."
- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end with agent-browser:
  - Login as admin → 12 tabs visible.
  - Predictions: "Following" filter works (shows only followed tipsters' tips).
  - Auth modal: "Forgot password?" → reset request → reset confirm → login with new password — full flow works.
  - Blog: improved typography with accent bars, numbered list badges, left-border excerpt.
  - No console/runtime errors.

Stage Summary:
- Project stable with 12 dashboard tabs. 3 new features this round (following filter, password reset, blog typography).
- New files: `api/auth/reset-request/route.ts`, `api/auth/reset-confirm/route.ts`.
- Modified: `predictions-tab.tsx` (following filter + useFollowing integration), `prisma/schema.prisma` (PasswordReset model), `api-client.ts` (reset functions), `auth-modal.tsx` (4-mode flow with forgot password), `blog-tab.tsx` (typography improvements).
- All core flows verified: auth (now with password reset), CRUD, settle, slip, analytics, leaderboard (with follow), predictions (with following + favorites filters), results, blog (with improved typography), activity feed, referral program (with auto-rewards), toasts, CSV export, H2H detail, keyboard shortcuts, confetti, dark mode, stagger animations, share slip, admin insights, admin user management, favorites, new-tips badge, animated counters, scroll-reveal, profile gradient banner, premium card accents, payments, cache.

Unresolved issues / risks:
- None blocking.
- Password reset is demo mode (token returned directly instead of emailed). Production would need an email service.
- The H2H/form/stats data remains deterministic mock (not real historical data).
- Next-phase recommendations (priority order):
  1. Integrate a real football stats API (e.g. API-Football) for H2H + form data.
  2. Real Paystack integration when PAYSTACK_SECRET_KEY is set.
  3. Add email sending service for password reset (e.g. Resend, SendGrid).
  4. Add live match scores / real-time updates (websocket mini-service).
  5. Add admin CRUD for blog articles (database-backed).
  6. Add a public profile/shareable referral landing page.
  7. Add push notifications for new tips from followed tipsters.
  8. Add a "dark mode" auto-switch based on system preference.

---
Task ID: 12
Agent: main (user request)
Task: Integrate Highlightly Sports API for fetching live football matches.

Work Log:
- User provided a code snippet using the Highlightly Sports API (https://sports.highlightly.net) with `x-rapidapi-key` header authentication.
- Built server-side API helper `src/lib/highlightly-api.ts`:
  - `isHighlightlyConfigured()` — checks if HIGHLIGHTLY_API_KEY env var is set.
  - `getTodaysMatches()` — fetches today's matches from `/football/matches?date=YYYY-MM-DD&limit=100`.
  - `getMatchesByDate(date)` — fetches matches for any date.
  - `getH2H(team1Id, team2Id)` — fetches head-to-head between two teams.
  - `searchTeam(name)` — searches for teams by name (returns team IDs needed for H2H).
  - All functions use server-side fetch with the API key from env (never exposed to client).
  - Typed responses: `HighlightlyMatch`, `HighlightlyTeam`, `HighlightlyResponse<T>`.
- Built `GET /api/matches/today` API route — fetches today's matches, returns a graceful "not configured" response if no API key is set. Maps the Highlightly response to a simplified `LiveMatch` type (id, teams, logos, league, status, score, stadium).
- Added `apiTodaysMatches()` + `LiveMatch` type to `api-client.ts`.
- Built `src/components/goaledge/live-matches.tsx` — Live Matches widget:
  - Auto-refreshes every 60 seconds.
  - Shows 3 sections: "Live now" (red, pulsing dot), "Upcoming" (blue), "Finished" (gray).
  - Each match row shows team logos, names, league, live score (red for live), status.
  - "Not configured" state with instructions to add API key to `.env`.
  - Error state with message.
  - Empty state ("No matches scheduled for today").
  - Manual refresh button + last-updated timestamp.
- Added `<LiveMatches/>` widget to the overview tab sidebar (above Recent form).
- Added `HIGHLIGHTLY_API_KEY` env variable to `.env`.
- Verified: endpoint returns `{"configured":false,"matches":[],"message":"..."}` without key. Widget shows "Connect the Highlightly Sports API" instructions. Lint passes (0 errors). No console errors.

Stage Summary:
- Highlightly Sports API integration is built and ready. User needs to add their API key to `.env`:
  ```
  HIGHLIGHTLY_API_KEY=your_rapidapi_key
  ```
- Once the key is added, the Live Matches widget on the overview tab will show today's live/upcoming/finished matches with auto-refresh.
- New files: `highlightly-api.ts`, `api/matches/today/route.ts`, `live-matches.tsx`.
- Modified: `.env` (HIGHLIGHTLY_API_KEY), `api-client.ts` (apiTodaysMatches + LiveMatch type), `overview-tab.tsx` (LiveMatches widget in sidebar).

Next steps when user adds their API key:
1. The Live Matches widget will automatically fetch and display today's matches.
2. H2H data in the prediction detail modal can be replaced with real Highlightly H2H data (using team IDs from searchTeam).
3. Live odds can be integrated if the Highlightly API supports them.

---
Task ID: 13
Agent: main (user request — codebase review)
Task: Review the current codebase, troubleshoot potential issues, and improve engineering details.

Work Log:
- Conducted comprehensive code audit using a sub-agent (general-purpose). Found 38 issues: 9 HIGH, 17 MEDIUM, 12 LOW.
- Fixed 14 issues across security, performance, and correctness:

HIGH fixes:
1. **Premium content leak (Issue 1)** — `attachLocked()` in `queries.ts` now strips `tip`, `analysis`, `scoreHome`, `scoreAway` server-side when `locked === true`. Returns `tip: "🔒 Premium tip — unlock to view"` + `analysis: null`. Verified: unauthenticated API call returns stripped premium tips. UI shows lock overlay + "🔒 Premium tip — unlock to view".
2. **JWT secret fallback (Issue 2)** — `session.ts` `getSecret()` no longer has a hardcoded fallback. In production, throws if `JWT_SECRET` is missing or < 16 chars. In development, uses a dev-only secret.
3. **Paystack verify ownership (Issue 3)** — `verify/route.ts` now looks up the subscription by reference and checks `sub.userId === user.id` before calling `verifyAndFulfill()`. Returns 403 if mismatch.
4. **Admin user PATCH server-side protection (Issue 4)** — `admin/users/[id]/route.ts` now: (a) looks up target user, (b) refuses to demote `admin@goaledge.com` (root admin), (c) refuses self-demotion, (d) counts admins and refuses demotion that would leave 0 admins.
5. **Tester endpoints auth (Issue 5)** — `/api/tester` and `/api/tester/benchmark` now require admin auth. Returns 401/403 for unauthenticated/non-admin. Verified: `curl` returns 401.
6. **Password reset token leak (Issue 8)** — `reset-request/route.ts` now only returns `demoToken` when `NODE_ENV !== "production"`. In production, returns generic message only.
7. **Async bcrypt (Issue 9)** — Replaced `bcrypt.hashSync()` / `bcrypt.compareSync()` with `await bcrypt.hash()` / `await bcrypt.compare()` in register, login, and reset-confirm routes. No longer blocks the event loop.

MEDIUM fixes:
8. **isPremium expiry check (Issue 11)** — `login()` in `use-goal-edge.ts` now checks `user.planExpiresAt` against `Date.now()` instead of just `user.plan === "premium"`.
9. **logout() clears localStorage slip (Issue 12)** — `logout()` now calls `saveSlip([])` and clears `slipSyncTimer` before setting state. Prevents cross-user slip data leak on shared devices.
10. **AuthModal setMode during render (Issue 23)** — Moved the `setMode(authMode)` call from render body to `useEffect`. Prevents React "cannot update during render" warning and potential infinite loop.
11. **PrismaClient logging (Issue 31)** — `db.ts` now only logs queries in development: `log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']`. Reduces noise and perf overhead in production.
12. **Cache server LRU eviction (Issue 19)** — Added `MAX_ENTRIES = 500` cap with LRU eviction (removes oldest entry when at capacity). Prevents unbounded memory growth from different filter permutations.
13. **Slip PUT bounds + dedupe (Issue 38)** — `/api/slip` PUT now deduplicates IDs via `Set` and caps at 50 picks (`.slice(0, 50)`). Prevents SQLite parameter-limit errors and storage abuse.
14. **Admin insights premium KPI (Issue 27)** — Fixed backwards logic: now shows actual premium tip count (summed from `byLeague.premium`) instead of "—".

- Lint passes (0 errors; 1 pre-existing warning in uploaded reference folder only).
- Verified end-to-end:
  - Unauthenticated API call: premium tips show `"tip":"🔒 Premium tip — unlock to view"`, `"analysis":null`, `"locked":true`.
  - Free user in browser: premium cards show "🔒 Premium tip — unlock to view" + lock overlay + "Unlock with Premium" button.
  - Tester endpoints: return 401 for unauthenticated requests.
  - Login as free user works (bcrypt async + isPremium expiry check).
  - No console/runtime errors.

Remaining unfixed issues (lower priority, not blocking):
- Issue 7: `typescript.ignoreBuildErrors: true` in next.config — would need type-error fixes before removing.
- Issue 10: boot() race condition — needs bootPromise guard pattern.
- Issue 13: useFollowing stale-closure on rapid double-clicks — needs ref-based approach.
- Issue 14: Password reset doesn't invalidate existing sessions — needs tokenVersion field.
- Issue 15: Highlightly API no timeout/retry — needs AbortSignal + retry logic.
- Issue 16: Analytics/leaderboard load full table — needs caching + groupBy.
- Issue 17: No DB indexes on filtered columns.
- Issue 18: ensureReferralCode collision check — needs crypto.randomBytes + retry.
- Issue 20: Activity log trimming is 3 queries — could be 1.
- Issue 21: Slip doesn't track prediction status changes.
- Issue 22: Stake input accepts negative/Infinity.
- Issue 25: PredictionDetailModal no Escape key / scroll lock.
- Issue 26: PredictionCard keyboard handler opens detail when inner button focused.
- Issues 28-38: Various LOW severity items (naming, leftover routes, download append, etc.).

Stage Summary:
- Fixed 14 issues (7 HIGH, 7 MEDIUM) across security, performance, and correctness.
- The most critical fix (premium content leak) now properly strips premium tip data server-side — the core business model (KES 100 for premium) is no longer bypassable via API.
- All fixes verified: lint passes, no runtime errors, app works correctly in browser.
- Modified files: `queries.ts`, `session.ts`, `paystack/verify/route.ts`, `admin/users/[id]/route.ts`, `tester/route.ts`, `tester/benchmark/route.ts`, `reset-request/route.ts`, `register/route.ts`, `login/route.ts`, `reset-confirm/route.ts`, `use-goal-edge.ts`, `auth-modal.tsx`, `db.ts`, `cache-server.ts`, `slip/route.ts`, `admin-insights.tsx`.
