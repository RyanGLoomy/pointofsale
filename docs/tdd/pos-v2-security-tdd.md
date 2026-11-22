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

## RBAC v2 (PRD implementation)

Source PRD: `/home/neotron/.opencode/plan/role-access-prd.md`

| Stage | Command | Result |
|-------|---------|--------|
| RED (permission matrix) | `npx vitest run src/lib/permissions.test.ts` | FAIL — 7 cases (KASIR transactions:read, ADMIN orders:manage/transactions:create/reports:print, OWNER orders:manage/transactions:create, receipt:print:own) |
| GREEN | same + `npx tsc --noEmit` | PASS — 26/26 |
| RED (account schemas) | `npx vitest run src/lib/accounts.test.ts` | FAIL — module missing |
| GREEN | same | PASS — 8/8 |
| RED (PDF model) | `npx vitest run src/lib/report-pdf.test.ts` | FAIL — module missing |
| GREEN | same | PASS — 4/4 |
| Full suite | `npm run test:coverage` | PASS — 147 tests, 100% stmts/funcs/lines, 96.93% branches |
| E2E | `npx playwright test` | PASS — 24/24 (18 existing + 6 RBAC) |
| Commits | `git log feat/pos-v2` | `017cd5a`/`4e7b411`, `ed1e401`/`f37d0b7`, `bfeafb8` |

Guarantees:
- KASIR cannot reach `/admin/*` or `/owner` and has no `transactions:read`; only Kasir nav item.
- ADMIN cannot reach `/kasir` or `/owner`; sees accounts/menu/transactions/reports; `Unduh PDF` visible and downloads `laporan-penjualan-YYYY-MM-DD.pdf`.
- OWNER cannot reach `/kasir` or `/admin` management pages; reports are read-only with no PDF button.
- role/active state is read from the DB on every request; stale JWT cannot authorize.
- logout stays on the same origin and clears `pos.cart.v1`.

## Fine-tuning batch (items 1–4)

| Item | RED / GREEN evidence |
|------|----------------------|
| 1. Lockout DB | `src/lib/lockout.test.ts` RED (module missing) → GREEN 7/7. `LoginAttempt` table pushed (`prisma db push`, diff clean). E2E: 5 failed logins show "Akun terkunci ... Coba lagi dalam N menit"; unique test email, rows cleaned afterwards. |
| 2. Strict CSP | `src/lib/product-visual.test.ts` RED (`productToneClass is not a function`) → GREEN 9/9. All `style={{...}}` removed; dynamic values via nonced `<style>`. Browser check: 0 CSP violations, gradients and chart bars computed correctly. |
| 3. Guard consistency | `/admin` now `requirePermission("users:manage")` instead of a role array. |
| 4. Action denial | `src/actions/action-guards.test.ts` 6/6: checkoutPOS denied for ADMIN/OWNER, createMenu denied for KASIR/OWNER, createAccount denied for KASIR/OWNER — all before DB writes. |

Full verification after batch: build, tsc, lint, 162 unit tests, coverage 100% stmts/funcs/lines & 96.93% branches, **25/25 E2E** (18 original + 7 RBAC/lockout), npm audit 0.

## Perf tuning (login & navigasi)

| Perubahan | Bukti |
|-----------|-------|
| `getDbUser` dibungkus `React.cache()` — layout & page berbagi 1 query DB per request | dokumentasi Next 16: React.cache mendeduplikasi query ORM dalam satu request |
| Login: hapus `getSession()` + `router.refresh()`, `router.replace("/")` memakai redirect role dari JWT | Playwright timing: **2602 ms → 1340 ms**, `/api/auth/session` **1 → 0** |
| Sidebar `prefetch={true}` untuk Kasir / Riwayat / Laporan | Playwright: klik Laporan **0 request jaringan** saat navigasi (prefetch penuh), 3x berturut-turut 177/130/133 ms |

Verifikasi: 162 unit tests, build/tsc/lint ok, **25/25 E2E** lulus setelah perubahan.

## Menu photos (Vercel Blob)

- Blob store `menu-images` (public, `iad1`) dibuat & terhubung ke project; `BLOB_READ_WRITE_TOKEN` terdaftar di Production/Preview/Development.
- `Menu.imageUrl` ditambahkan via `prisma db push`.
- RED: `src/lib/menu-image.test.ts` (module missing) → GREEN 6/6; `src/actions/action-guards.test.ts`扩展到 8/8 termasuk `uploadMenuImage` ditolak untuk KASIR/OWNER sebelum upload.
- E2E `e2e/menu-image.spec.ts`: admin upload → thumbnail tampil di daftar menu & tile kasir; cleanup menghapus gambar. Blob Count kembali 0.
- Audit: nested `zod@4.1.11` dari `@vercel/blob` di-override ke `4.6.7` — 0 vulnerabilities.
- CSP `img-src` mengizinkan host Blob; `serverActions.bodySizeLimit` 4mb.

Verifikasi: build, tsc, lint, 170 unit, coverage ≥80%, **26/26 E2E**, audit 0.

## Initial menu photos

- Production deployment promoted: `dpl_8yWDBU5DSjfVbtG3Z7RiStgQQYHn` (commit `abc45d6`).
- Tiga menu awal diberi foto CC0 dari Wikimedia Commons, diunggah ke Blob, dan `Menu.imageUrl` diisi (lihat `docs/menu-images.md`).
- Verifikasi browser di URL production: 3 tile kasir memuat gambar dari host Blob (`naturalWidth=960`), 0 pelanggaran CSP.

## Known gaps

- Vercel SSO still blocks unauthenticated browser/smoke checks on preview; app-level verification was done locally and via authenticated user session.
- Lockout window remains 5 attempts / 5 minutes; no admin unlock UI (account deactivation is available).

- `npm audit` was 3 high from Prisma 7's `@prisma/config` pinning `effect@3.20.0` (ReDoS in `<=3.22.0`). Resolved with `overrides.effect = 3.22.5` — same major, patched. Re-verified: prisma validate/generate, build, tsc, lint, 110 tests, coverage, 18/18 E2E; `npm audit` now reports 0 vulnerabilities.
- In-memory login lockout resets on server restart; acceptable for single-instance POS deployment.
- CSP nonce wired via Next 16 proxy; pages are dynamically rendered (auth-gated), nonce applied during SSR.
