# POS v2 — Security & Upgrade TDD Evidence

**Branch:** `feat/pos-v2`
**Date:** 2026-11-21
**Scope:** Backend security/correctness hardening, dependency upgrade to Next 16 + Prisma 7 + Zod 4, report timezone, design tokens, login/POS restyle, Next 16 proxy security headers.

## Source plan

No `*.plan.md` file was used. Scope was agreed in conversation and confirmed via
structured questions before implementation: design direction "Pasar", dependency
upgrade "Next 16 + Prisma 7", backend coverage "Semua".

## User journeys

1. As a cashier, I want the system to attribute a transaction to the signed-in cashier, so that records cannot be forged.
2. As an admin, I want only authorized roles to manage menus, so that the catalog cannot be tampered from the client.
3. As a user, I want reports grouped by the store day (Asia/Jakarta), so that evening transactions are not misattributed.
4. As an operator, I want checkout stock decrements to be atomic, so that overselling cannot occur.
5. As a user, I want the UI to feel like a deliberate product, not a generic template.

## Task report

| Stage | Command | Result |
|-------|---------|--------|
| RED (checkout validation) | `npx vitest run src/lib/checkout.test.ts src/lib/reports.test.ts` | FAIL — module `./checkout` missing; daily totals grouped by UTC |
| GREEN (checkout validation + Jakarta grouping) | same | PASS — 24/24 |
| GREEN (full suite) | `npm test` | PASS — 109 tests |
| Phase 1 fix commit | `git log feat/pos-v2` | `208b393` |
| Phase 2 upgrade commit | `git log feat/pos-v2` | `e0a35cb` — next 16.4.6, react 19.3.1, prisma 7.10.1, zod 4, `@prisma/adapter-pg`, `prisma.config.ts` |
| Phase 2 verification | `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run test:coverage` | PASS — build ok, tsc ok, lint ok, 109 tests ok, coverage 100% stmts / 96.93% branch |
| Phase 2 E2E | `npx playwright test` | PASS — 18/18 (chromium) |
| Phase 4 design commit | `git log feat/pos-v2` | `41baeaa` — Pasar tokens, Instrument fonts |
| Phase 5/6 commit | `git log feat/pos-v2` | `4cddddf` — login/POS restyle, `src/proxy.ts` security headers + CSP nonce, AGENTS.md next rules |

## Test specification

| # | What is guaranteed | Test file or command | Test type | Result | Evidence |
|---|--------------------|----------------------|-----------|--------|----------|
| 1 | Checkout rejects empty, duplicate, over-range, or invalid-method payloads | `src/lib/checkout.test.ts` | unit | PASS | `npx vitest run src/lib/checkout.test.ts` |
| 2 | Checkout accepts valid multi-line cash/QRIS payloads | `src/lib/checkout.test.ts` | unit | PASS | `npx vitest run src/lib/checkout.test.ts` |
| 3 | Daily totals group by Asia/Jakarta day | `src/lib/reports.test.ts` | unit | PASS | `npx vitest run src/lib/reports.test.ts` |
| 4 | Daily series anchors on the Asia/Jakarta day | `src/lib/reports.test.ts` | unit | PASS | `npx vitest run src/lib/reports.test.ts` |
| 5 | Full suite regression | `npm test` / `npm run test:coverage` | unit | PASS | 109/109, coverage >= 80% |
| 6 | Auth + POS + admin + owner flows | `e2e/pos.spec.ts` | E2E | PASS | 18/18 |

## Coverage and known gaps

- Coverage on configured libs: 100% statements / 100% functions / 100% lines, 96.93% branches (threshold 80%).
- No new unit coverage added for `src/proxy.ts`, server actions, or auth lockout (in-memory); these are validated via build + E2E + security review.

## Merge evidence

- RED validated on `feat/pos-v2` before GREEN implementation; GREEN validated by full suite re-run.
- Phase gates: baseline (build/tsc/lint/tests) → Phase 1 fix → Phase 2 upgrade → Phase 4 design → Phase 5/6 hardening → final verification.

## Follow-up: product tile palette

| Stage | Command | Result |
|-------|---------|--------|
| RED | `npx vitest run src/lib/product-visual.test.ts` | FAIL — `Kopi Suroko -> #06b6d4` not in earth-tone set |
| GREEN | same | PASS — 7/7; full suite 110/110, coverage unchanged |
| Commit | `git log feat/pos-v2` | `0b00324` (RED), `d1f485d` (GREEN) |

## Known gaps

- `npm audit` reports 3 high findings, all from Prisma 7 dependency chain (`effect` ReDoS); the suggested fix forces a Prisma downgrade (breaking), so it is deferred.
- In-memory login lockout resets on server restart; acceptable for single-instance POS deployment.
- CSP nonce wired via Next 16 proxy; pages are dynamically rendered (auth-gated), nonce applied during SSR.
