# POS UX Affordances — TDD Evidence

**Branch:** `main`
**Date:** 2026-11-20
**Scope:** Desktop-first UX polish on the existing POS shell. Password reveal, toast + confirm feedback, cash/change tender, cart persistence, receipt detail/reprint, labeled navigation, and page loading/error/404 states. No schema migration, no new dependencies, no auth changes.

## Source plan

No `*.plan.md` file was used. Scope was agreed as a four-phase polish plan: (1) login + feedback primitives, (2) app shell + page states, (3) cashier flow, (4) small touches.

## User journeys

1. As a cashier, I want to reveal my password and see a Caps Lock hint, so that I can sign in without a lockout.
2. As a cashier, I want to see clear feedback for saved/removed actions, so that I trust the terminal during busy hours.
3. As a cashier, I want to enter cash received and see the change, so that I can hand correct change to the customer.
4. As a cashier, I want my in-progress cart to survive a reload, so that an accidental refresh does not lose the order.
5. As an admin, I want to confirm destructive actions and see a detailed, printable receipt, so that records stay accurate.
6. As any user, I want clear loading, error, and not-found states, so that the app never feels blank or broken.

## Task report

| Stage | Command | Result |
|-------|---------|--------|
| RED (unit, helpers) | `npm run test:coverage` | FAIL — `Cannot find module './cart'` / `'./money'` / `'./receipt'` |
| GREEN (unit, helpers) | `npm run test:coverage` | PASS — 100 tests across 7 files |
| Coverage | `npm run test:coverage` | 100% statements, 98.93% branches, 100% functions, 100% lines on covered libs |
| Types | `npx tsc --noEmit` | PASS (0 errors) |
| Lint | `npm run lint` | PASS (no warnings) |
| Build | `npm run build` | PASS (Next.js 15.5.29) |
| E2E | `npx playwright test --reporter=line` | PASS — 18/18 (chromium, `npm run dev`, local DB) |

### Evidence notes

- The three helper modules (`src/lib/cart.ts`, `src/lib/money.ts`, `src/lib/receipt.ts`) were RED-validated before implementation in commits `0fd5b9f` / `cb61cf8`; two wrong expectations in those tests were corrected during GREEN (separator grouping, quick-cash option count).
- UI primitives are exercised through the E2E suite rather than a DOM unit runner: the project has no jsdom/happy-dom installed, and adding one was out of scope. No E2E RED capture was recorded before implementation in this pass — the suite is the acceptance gate and all 18 tests pass against the finished UI.
- `src/lib/reports.ts` branch coverage is 96.42%; the single uncovered branch is a pre-existing fallback in the daily-series helper and is unrelated to this pass.

## Test specification

| # | What is guaranteed | Test file or command | Test type | Result | Evidence |
|---|--------------------|----------------------|-----------|--------|----------|
| 1 | Cart add/merge/decrement/remove respects stock and is immutable | `src/lib/cart.test.ts` | unit | PASS | `npm run test:coverage` |
| 2 | Persisted cart restore ignores untrusted names/prices and clamps to live stock | `src/lib/cart.test.ts` | unit | PASS | `npm run test:coverage` |
| 3 | Amount masking keeps digits only and groups thousands | `src/lib/money.test.ts` | unit | PASS | `npm run test:coverage` |
| 4 | Quick-cash options are the exact total plus rounded notes, deduped and capped at 3 | `src/lib/money.test.ts` | unit | PASS | `npm run test:coverage` |
| 5 | Change is computed correctly and shortfall is detected | `src/lib/money.test.ts` | unit | PASS | `npm run test:coverage` |
| 6 | Receipt numbers are stable (`TRX-YYYYMMDD-XXXXXX`) and payment labels resolve | `src/lib/receipt.test.ts` | unit | PASS | `npm run test:coverage` |
| 7 | Password reveal toggles `type` without losing the typed value | `e2e/pos.spec.ts:reveals and hides the password` | E2E | PASS | `npx playwright test` |
| 8 | Empty login form shows per-field errors and focuses the first invalid field | `e2e/pos.spec.ts:validates required fields` | E2E | PASS | `npx playwright test` |
| 9 | Exact-cash checkout shows a receipt dialog with a receipt number and change row | `e2e/pos.spec.ts:checkout with exact cash` | E2E | PASS | `npx playwright test` |
| 10 | Overpayment shows `Rp 85.000` change before payment | `e2e/pos.spec.ts:cash overpayment shows the change` | E2E | PASS | `npx playwright test` |
| 11 | Cart survives a page reload and shows a restore banner | `e2e/pos.spec.ts:cart is restored after a reload` | E2E | PASS | `npx playwright test` |
| 12 | Removing the last unit offers an undo action that restores the line | `e2e/pos.spec.ts:removing the last unit can be undone` | E2E | PASS | `npx playwright test` |
| 13 | Clearing the cart requires confirmation; cancel keeps the cart | `e2e/pos.spec.ts:clearing the cart requires confirmation` | E2E | PASS | `npx playwright test` |
| 14 | Admin transaction detail opens with a reprint action | `e2e/pos.spec.ts:admin can open transaction detail and reprint` | E2E | PASS | `npx playwright test` |

## Known gaps

- Toast/confirm/modal primitives have no isolated unit tests (no DOM test environment). They are covered indirectly by the E2E flows above.
- Receipt printing relies on the browser print dialog; no print CSS assertions in E2E.
- Cart persistence is `localStorage`-only, so it does not sync across devices or browsers.
