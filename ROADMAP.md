# Mantra — ROADMAP (v0.1 only)

Sequential milestones. Each ends **green**: typecheck passes, tests pass, builds.
Each library milestone is independently testable before the CLI wires them up.

## M0 — Scaffold
pnpm workspace, `tsconfig.base.json`, per-package `tsup`/`vitest`, named empty
packages, cli bin stub.
**Done when:** `pnpm install`, `pnpm -r build`, `pnpm -r test` all run; `mantra --help` prints.

## M1 — Parser  (`@mantra/parser`)
`parse()` + types. Tests: both input shapes, malformed JSON, missing `name`,
empty list.
**Done when:** parser tests green.

## M2 — Rules  (`@mantra/rules`)
Four detectors (R1–R4) + `runRules` + pattern constants. Tests: each rule with a
positive and a negative fixture.
**Done when:** rules tests green; clean tool produces zero findings.

## M3 — Scorer  (`@mantra/scorer`)
`score()` + weights + formula + grade bands. Tests: empty → 0/low; one
high-severity tool → high; mixed set hits the expected band.
**Done when:** scorer tests green.

## M4 — Reporter  (`@mantra/reporter`)
`renderText` + `renderJson`. Tests: a fixture report renders stable text and
valid JSON.
**Done when:** reporter tests green.

## M5 — CLI wiring  (`apps/cli`)
`analyze` command, `--json`, `--fail-on`, exit codes, input-error handling.
e2e test runs the built bin against `fixtures/sample-tools.json`.
**Done when:** `mantra analyze <file>` prints a report; `--fail-on` gates exit.

## M6 — Polish
README usage, one realistic `fixtures/sample-tools.json`, final lint/typecheck.
**Done when:** v0.1 tagged.

---

**Explicitly deferred (not v0.1):** config files, custom/plugin rules, remote
fetch, auto-fix, watch mode, severity tuning flags.
