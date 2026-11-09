# Dependency audit and Node 24 engine support

This ExecPlan is a living document and follows `PLANS.md`.

## Purpose / Big Picture

Explain the current npm audit concentration and allow the reported Node 24 LTS runtime in the package engine metadata. Success is observable in the root package manifest and lockfile metadata; this is a local dependency/configuration review, not an Angular upgrade.

## Progress

- [x] (2026-11-06) Inspected package manifest, lockfile diff, and current `npm audit` summary.
- [x] (2026-11-06) Updated the declared Node engine range in `package.json` and lockfile root metadata to include Node 24.
- [x] (2026-11-06) Reviewed the resulting diff and recorded audit sources and compatibility limits.

## Surprises & Discoveries

- Observation: `^22.13.1` excludes Node 24 because a caret range cannot cross major version 22.
  Evidence: `package.json` and lockfile root metadata both declare `^22.13.1`.
- Observation: Audit output includes findings across runtime dependencies and development/build tooling; Angular's old major is a large cluster but not the only source.
  Evidence: `npm audit --json` reports 93 findings (16 low, 53 moderate, 20 high, 4 critical) across 1,574 dependency nodes.
- Observation: The production-only audit still counts CLI/compiler tooling because several build packages, including `@angular/cli`, are declared under `dependencies`.
  Evidence: `npm audit --omit=dev --json` reports 54 findings (6 low, 33 moderate, 12 high, 3 critical); `package.json` lists `@angular/cli` and `@angular/compiler-cli` as runtime dependencies.

## Decision Log

- Decision: Declare `^22.13.1 || ^24.0.0` so Node 24 is accepted while retaining the currently declared Node 22 line.
  Rationale: Angular 18's published compatibility range names Node 18, 20, and 22, but not 24; preserving 22 avoids claiming Node 24 is the only supported runtime while eliminating this package's EBADENGINE warning on Node 24.
  Date/Author: 2026-11-06 / Codex

## Outcomes & Retrospective

Node 24 is accepted by the project package metadata while Node 22 remains allowed. Audit findings remain and need a separately planned dependency remediation, especially where fixes require Angular/toolchain major upgrades.

## Context and Orientation

The app is an Angular 18 client-side SPA. This request touches only root dependency metadata in `package.json` and the corresponding root package record in `package-lock.json`. No routing, guards, UI, API, or environment replacement behavior is changed. The lockfile already has a user-created audit-fix diff; preserve its dependency changes and limit this task's lockfile edit to the root engine declaration.

## Plan of Work

Explain audit concentration from the current lockfile. Accept Node 24 in the root engine range while retaining Node 22, and keep package and lock metadata aligned. Defer dependency upgrades and Angular modernization because they are separate compatibility-sensitive work.

## Concrete Steps

From the repository root:

1. Edit the root `engines.node` value in `package.json` and the root package entry in `package-lock.json`.
2. Inspect `git diff` to confirm only those engine metadata lines were added by this task.

## Validation and Acceptance

Confirm both root engine declarations match and use semver that accepts Node 24. `npm pkg get engines.node` and a semver check passed for Node 22 and 24. No tests or build are needed for a metadata-only edit; do not run the install or force-fix audit because that would further rewrite the existing lockfile. Full and production-only audit summaries are recorded above.

## Idempotence and Recovery

The metadata edit is safe to repeat. If lockfile review shows unrelated changes from this task, revert only those unintended hunks and preserve the pre-existing lockfile audit-fix diff.

## Artifacts and Notes

`npm audit --json` currently reports 93 vulnerabilities. The supplied human-readable report shows Angular runtime packages, Angular build tooling, legacy `request`/`request-promise`, AWS SDK v2, Mermaid/KaTeX, and npm tooling as major dependency paths.

## Interfaces and Dependencies

Affected files: `package.json`, `package-lock.json`. No source interfaces, services, components, or third-party runtime behavior is directly changed.
