# POS UI Redesign — TDD Evidence

**Branch:** `feat/pos-ui-redesign`
**Date:** 2026-11-19
**Scope:** Full visual redesign of login, Kasir, Admin (dashboard, menus, transactions, reports), and Owner. Auth, Prisma models, server actions, and POS business flows are unchanged.

## Source plan

No `*.plan.md` file was used. Acceptance criteria were derived from the redesign request plus the existing flows in `src/actions/orders.ts`, `src/actions/menu.ts`, and `src/auth.ts`.

## User journeys

1. As a user, I can sign in from a branded screen and land on the correct area for my role.
2. As a cashier, I can add menu items to the cart, adjust quantities, run checkout, and print a receipt.
3. As an admin, I can see store stats, recent transactions, and low stock, and manage menu CRUD.
4. As an admin, I can review transactions and sales reports.
5. As an owner, I can review revenue KPIs, the daily chart, top menus, and recent transactions.

## Task report

| Stage | Command | Result |
|-------|---------|--------|
| RED (unit) | `npm test` | FAIL — `Cannot find module './format'` / `'./product-visual'` / `fillDailySeries is not a function` |
| RED (E2E) | `npx playwright test --grep "branded sign-in"` | FAIL — heading `Masuk ke POS` not found |
| GREEN (unit) | `npm test` | PASS — 33 tests, 3 files |
| GREEN (E2E) | `npx playwright test` | PASS — 8/8 |
| Coverage | `npm run test:coverage` | 100% statements, 96.87% branches, 100% functions, 100% lines on covered libs |
| Types | `npx tsc --noEmit` | PASS |
| Lint | `npm run lint` | PASS (no warnings) |
| Build | `npm run build` | PASS (Next.js 15.5.29, Turbopack) |

## Test specification

| # | Guarantee | Test file | Type | Result |
|---|-----------|-----------|------|--------|
| 1 | Rupiah amounts format as `Rp 15.000`, including zero, millions, rounding, and negatives | `src/lib/format.test.ts` | unit | PASS |
| 2 | Dates format in Indonesian locale, including a full date with year | `src/lib/format.test.ts` | unit | PASS |
| 3 | Class merge helper drops falsy values | `src/lib/format.test.ts` | unit | PASS |
| 4 | Product gradients are deterministic and safe for empty seeds | `src/lib/product-visual.test.ts` | unit | PASS |
| 5 | Product initials trim input and fall back to `?` | `src/lib/product-visual.test.ts` | unit | PASS |
| 6 | Numeric/Decimal totals normalize to finite numbers | `src/lib/reports.test.ts` | unit | PASS |
| 7 | Malformed order item payloads never crash report aggregation | `src/lib/reports.test.ts` | unit | PASS |
| 8 | Daily totals group and sort by UTC day | `src/lib/reports.test.ts` | unit | PASS |
| 9 | Item quantities aggregate across transactions | `src/lib/reports.test.ts` | unit | PASS |
| 10 | The chart series always covers a zero-filled 14-day window across month boundaries | `src/lib/reports.test.ts` | unit | PASS |
| 11 | Unauthenticated access to `/kasir` and `/admin` redirects to `/login` | `e2e/pos.spec.ts` | E2E | PASS |
| 12 | Login screen shows branded heading, CTA, and value proposition | `e2e/pos.spec.ts` | E2E | PASS |
| 13 | Kasir login lands on the terminal with cart panel | `e2e/pos.spec.ts` | E2E | PASS |
| 14 | Adding an item shows quantity/price, and checkout opens a receipt dialog | `e2e/pos.spec.ts` | E2E | PASS |
| 15 | Admin login lands on the dashboard with stats and icon navigation | `e2e/pos.spec.ts` | E2E | PASS |
| 16 | Admin can open menu management | `e2e/pos.spec.ts` | E2E | PASS |
| 17 | Owner login lands on the sales report with average transaction KPI | `e2e/pos.spec.ts` | E2E | PASS |

## Coverage and known gaps

- Unit coverage is limited to pure helpers in `src/lib/format.ts`, `src/lib/product-visual.ts`, and `src/lib/reports.ts`; UI components are covered through Playwright rather than component tests.
- E2E covers one checkout path (cash). Card/QRIS selection renders but is not asserted end to end.
- Menu create/update flows are exercised manually; existing server action validation is unchanged.
- `next start` fails on the Turbopack build in this environment (`routesManifest.dataRoutes is not iterable`); verification used `next build` plus the dev server. This predates the redesign and does not affect Vercel's build pipeline.

## Merge evidence

RED: unit modules missing (module resolution failures) and login heading missing in Playwright.
GREEN: 33/33 unit tests and 8/8 E2E tests passed on the final code, after the chart, dashboard, and report polish.
