# SC-40234: Align hierarchy submission with clark-service

This ExecPlan is maintained according to `PLANS.md`.

## Purpose / Big Picture

Send the hierarchy submission fields required by the migrated backend. Retain the separately identified Builder “Move to Review” bug fix, as explicitly requested by the user. The client continues using its existing gateway URL and bearer-token interceptor.

## Progress

- [x] (2026-10-28) Matched hierarchy submission to the migrated backend contract.
- [x] (2026-10-28) Forwarded the form's authorizations and reason; added request/auth and form tests.
- [x] (2026-10-28) Fixed the existing Builder status-readiness no-op and switch fallthrough; added fetch/store/modal regressions.
- [x] (2026-10-28) Passed 24 focused tests, app TypeScript compilation, focused ESLint, and formatting checks.
- [x] (2026-10-28) Verified companion gateway routing and live hierarchy submission; manually confirmed hierarchy release.
- [x] (2026-10-28) Reviewed PR scope: retain compatibility changes, the requested bug fix, and their tests; remove excess planning history.

## Surprises & Discoveries

The existing hierarchy form collected `selectedAuthorizations` and `submissionReason` but omitted them from hierarchy requests. The migrated backend requires authorizations; an empty array is valid.

The Builder's `savedCorrectly` guard already existed on main at `f76430718`. A fresh load left it false, silently blocking status changes. A successful save earlier in the app session could make the same action work. The store also allowed blocked status actions to fall through into bundling.

## Decision Log

- Decision: Keep the current client URL, authentication, environment configuration, and UI. Forward the existing form values through the existing hierarchy PATCH call.
  Rationale: The companion gateway performs the backend retargeting.
  Date/Author: 2026-10-28 / Codex
- Decision: Retain the Builder bug fix alongside the compatibility changes.
  Rationale: The user explicitly requested that the bug fix stay when reducing PR scope. Pending/failed saves remain blocked, with visible errors and retry support.
  Date/Author: 2026-10-28 / User and Codex

## Outcomes & Retrospective

Hierarchy submission forwards the existing authorizations and reason. Successfully loaded objects can change status without an unrelated edit. Blocked or failed status changes show an error, release the modal's busy state, and cannot trigger bundling. Duplicate confirms are prevented. The original single-object POST and hierarchy PATCH endpoints remain unchanged.

## Context and Orientation

`src/app/core/learning-object-module/learning-object/learning-object.service.ts` owns hierarchy API calls. `src/app/onion/shared/submit/submit.component.ts` supplies the form values. `src/app/onion/learning-object-builder/builder-store.service.ts` owns save readiness and status actions. Its `components/editor-action-panel/change-status-modal/change-status-modal.component.ts` handles confirmation and feedback.

## Plan of Work

Pass `selectedAuthorizations: string[]` and optional `submissionReason` from the form into `submitHierarchy`, preserving the existing collection/status fields and URL. Test the request body, bearer header, error propagation, and retained single-object POST behavior.

Initialize Builder readiness after successful fetch, reset it when fetching, and explicitly reject failed, invalid, pending, or cached saves before changing status. Let the modal surface errors and reset its busy state in `finally`. Preserve successful navigation and changelog behavior. Cover these paths in the store and modal action specs.

## Concrete Steps

From clark-client, run the four focused suites with the explicit Angular transform below, then `./node_modules/.bin/tsc --noEmit -p src/tsconfig.app.json`. Run focused ESLint and Prettier checks on the changed files and `git diff --check`.

```sh
./node_modules/.bin/jest --runInBand --config '{"preset":"jest-preset-angular","roots":["src"],"setupFilesAfterEnv":["<rootDir>/src/setup-jest.ts"],"moduleNameMapper":{"@env(.*)":"<rootDir>/src/environments/$1","@entity(.*)":"<rootDir>/src/entity/$1"},"modulePaths":["<rootDir>/src"],"transform":{"^.+\\.(ts|js|mjs|html|svg)$":["jest-preset-angular",{"tsconfig":{"target":"ES2016","module":"commonjs","experimentalDecorators":true,"emitDecoratorMetadata":true,"esModuleInterop":true,"allowJs":true,"skipLibCheck":true,"baseUrl":"src","types":["jest","node"]},"stringifyContentPathRegex":"\\.(html|svg)$"}]}}' --runTestsByPath src/app/onion/learning-object-builder/builder-store.service.spec.ts src/app/onion/learning-object-builder/components/editor-action-panel/change-status-modal/change-status-action.spec.ts src/app/core/learning-object-module/learning-object/learning-object.service.spec.ts src/app/onion/shared/submit/submit-hierarchy.spec.ts --silent
```

## Validation and Acceptance

All 24 focused tests passed, covering payload/auth compatibility, form forwarding, fresh loads, failed fetches, blocked saves, error feedback, retries, duplicate confirms, and successful navigation. App TypeScript, focused ESLint, Prettier, and whitespace checks passed. The explicit test configuration avoids existing HTML-transform and ES5-target issues; shared Jest configuration is unchanged. A full Angular asset build was not run; the existing checkout lacks `src/env.js`.

Live verification through the companion gateway returned 204 for a three-level hierarchy submission as its author. All three objects became `waiting` in `onion.objects` and `onion.objects-index`, with exactly one active submission each in `onion.submissions`. Manual frontend hierarchy release also passed.

Manual bug-fix check: load an existing waiting object, select Move to Review and Confirm without editing first. Expect a single POST status request and a closed modal on success. Pending or failed saves must show an error and permit retry.

## Idempotence and Recovery

Focused tests and read-only checks are repeatable. Preserve unrelated work; revert only scoped changes when necessary. Live tests created separate disposable objects and left existing objects unchanged. Do not reset statuses directly in MongoDB to simulate a passing submission.

## Artifacts and Notes

The local submission fixture is named `SC-40234 Submission Check 20261028212451`, with parent ID `6ae268235bf89e2176d802b7`. It was left waiting for inspection. Scope reduction removed planning history; application behavior and regression coverage were retained because all remaining changes serve backend compatibility or the explicitly retained bug fix.

## Interfaces and Dependencies

`submitHierarchy(id, collection, selectedAuthorizations, submissionReason?)` requires the companion backend PATCH endpoint and gateway retargeting. No new packages, environment variables, auth policy, interceptor behavior, frontend routes, or deployment changes are introduced by this client PR.
