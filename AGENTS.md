# AGENTS.md — Point of Sale (pointofsale)

Project guidance for agents working in this repository.
Source of the workflow rules: upstream [affaan-m/ECC](https://github.com/affaan-m/ECC)
(OpenCode port lives on the upstream `main` branch; the npm `ecc-universal`
package still ships the V1 plugin format).

## Project Overview

Point-of-sale application. Stack not yet chosen (candidates: TypeScript /
Next.js + Postgres, Laravel + MySQL, Django + Postgres, or undecided).

## ECC Workflow (OpenCode)

This project consumes the ECC workflow kit through OpenCode:

- **Hooks plugin**: `ecc-hooks` (registered globally from
  `~/.config/opencode/plugins/`, V2 plugin definition ported from upstream
  `main`). Adds runtime hook checks (format, type-check, console.log audit,
  env injection, permission auto-approve, file tracking) and exposes tools
  `changed-files` and `dependency-analyzer`.
- **Agents** (`~/.config/opencode`-registered via `.opencode/opencode.json`):
  `build` (primary), plus `planner`, `architect`, `tdd-guide`, `code-reviewer`,
  `security-reviewer`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`,
  and language-specific reviewers.
- **Commands** (`.opencode/commands/`): `/plan`, `/tdd`, `/code-review`,
  `/security`, `/build-fix`, `/e2e`, `/refactor-clean`, `/orchestrate`, etc.
- **Skills** (`skills/`): ECC skills such as `tdd-workflow`, `security-review`,
  `coding-standards`, `frontend-patterns`, `frontend-slides`, `backend-patterns`,
  `e2e-testing`, `verification-loop`, `api-design`, `strategic-compact`,
  `eval-harness`.

## Working Agreements

- TDD mandatory: RED (failing test) → GREEN (minimal fix) → refactor; minimum
  80% coverage (unit + integration + E2E).
- Security mandatory before commit: no hardcoded secrets (env vars only),
  input validation, parameterized queries, XSS/CSRF handling, no sensitive data
  in logs, generic error messages to users.
- Git commits: conventional commits (`feat`, `fix`, `refactor`, `docs`, `test`,
  `chore`, `perf`, `ci`).
- Keep functions small (<50 lines), files focused (<800 lines), avoid deep
  nesting (>4 levels) via early returns.

## Verification Before Finish

Run the ECC verification loop before declaring work complete:

1. Build (`npm run build`)
2. Type check (`npx tsc --noEmit`)
3. Lint (`npm run lint`)
4. Tests with coverage (`npm run test -- --coverage`)
5. Security scan
6. Diff review

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
