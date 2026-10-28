# SC-40234: Route frontend hierarchy actions to clark-service

This ExecPlan is a living document maintained according to `PLANS.md`.

## Purpose / Big Picture

Make frontend hierarchy submission and release reach the migrated clark-service PATCH API through the existing local gateway at localhost:3000. Send the submission authorizations and reason already collected by the form. Verify the bearer token is forwarded without changing client authentication or environment configuration.

The client branch is `chore/sc-40234/migrate-hierarchy-apis-into-the-learning`. The user also authorized necessary gateway changes. Hierarchy-service is read-only. The gateway initially has a separate playlist branch and an unrelated uncommitted playlist-route change; preserve that change and no branch switch was performed because the user did not select a branch preference.

## Progress

- [x] (2026-10-28) Inspected client instructions, service calls, form fields, interceptor, environments, test/build configuration, and gateway dispatch.
- [x] (2026-10-28) Chose gateway cutover instead of a client-only direct-backend override after user authorized gateway edits.
- [x] (2026-10-28) Forwarded selectedAuthorizations/submissionReason from the form and added service/interceptor/form tests.
- [x] (2026-10-28) Retargeted gateway PATCH dispatch to CLARK_SERVICE_URI and removed the unused HIERARCHY_SERVICE_URI constant, allowlist entry, and required startup value. Unrelated playlist content is unchanged.
- [x] (2026-10-28) Seven client tests, client/gateway TypeScript and focused ESLint checks passed. Live local gateway smoke requests reached clark-service; final formatting checks follow below.
- [x] (2026-10-28) Recorded results, tooling caveat, branch state, and manual frontend test instructions.

- [x] (2026-10-28) Reproduced Move to Review silently skipping the request: savedCorrectly starts false and is never initialized on a successful existing-object fetch.
- [x] (2026-10-28) Initialize status-change readiness on fetch, reject blocked store actions instead of falling through to bundling, and surface errors/reset modal busy state.
- [x] (2026-10-28) Added fetch/store/modal regressions. All 24 focused tests, client TypeScript, and focused ESLint passed; final formatting checks are recorded below.

## Surprises & Discoveries

- The client already uses the same status URL for single-object POST and hierarchy PATCH; gateway method dispatch determines the target. No frontend URL change is necessary after gateway cutover.
- The interceptor already attaches a bearer token from the presence cookie to protected gateway requests; routing directly to port 3001 would require additional trusted-origin handling. Keep the existing gateway path.
- The hierarchy submission branch drops selectedAuthorizations and submissionReason, while the adjacent single-object submission branch forwards them. The migrated backend requires authorizations, and an empty array is valid.
- Client configuration names src/env.js as a build asset, but the file is absent locally. Do not invent or commit a replacement to make unrelated build setup appear complete.
- Gateway has no AGENTS.md, PLANS.md, or configured test runner in the inspected tree. Use TypeScript/lint checks and a real read-only proxy smoke test rather than introducing a testing framework.

- Follow-up discovery: ChangeStatusModalComponent.updateStatus silently returns when BuilderStore.savedCorrectly is false, leaving serviceInteraction true. The store also has a CHANGE_STATUS switch fallthrough into TOGGLE_BUNDLE on the same false guard. savedCorrectly is set only after a successful edit/save, not after loading persisted data. Recent gateway logs had no status request; reproducing the actual modal method with savedCorrectly false made zero store calls.

## Decision Log

- Decision: Stabilize the existing service and form in place; retain environment.apiURL, interceptor behavior, UI/state ownership, and other API routes.
  Rationale: The necessary cutover is gateway dispatch, and the user authorized gateway changes.
  Date/Author: 2026-10-28 / User and Codex
- Decision: Pass authorizations and reason from the existing form to submitHierarchy rather than fabricate consent in the service.
  Rationale: Matches the current backend submission contract and preserves the user's selected form values.
  Date/Author: 2026-10-28 / Codex

- Decision: Mark a successfully fetched persisted object as saved, reset readiness when a new fetch begins, and centralize status-change readiness checks in BuilderStore. Reject unsaved, failed, invalid, or pending saves with a visible error; always clear modal busy state. Keep single-object status POST and hierarchy PATCH semantics unchanged.
  Rationale: User explicitly asked to fix the diagnosed no-op while preserving save safety. No backend or database edit is needed.
  Date/Author: 2026-10-28 / User and Codex

## Outcomes & Retrospective

The local gateway now routes hierarchy PATCH requests to clark-service. Client hierarchy submission includes the actual form authorizations and reason. Client environment/interceptor code is unchanged. Seven tests passed across the request/auth service suite and the form action test. Client and gateway compilation plus focused lint checks passed.

The live read-only smoke check through the running gateway returned 401 for missing credentials, 404 Requester not found for a signed nonexistent identity, and 400 with the current status enum for proofing. The old service would request the presence cookie; the observed responses prove the gateway reaches the migrated backend without mutating objects.

The client remains on the requested hierarchy branch. The gateway remains on feature/sc-39965/implement-playlist-crud-apis-and-owner; its preexisting playlist edit was preserved byte-for-byte. No hierarchy-service, clark-service, client environment, or deployment compose files were edited in this frontend/gateway task.

## Context and Orientation

`src/app/onion/shared/submit/submit.component.ts` collects submissionReason and selectedAuthorizations and calls the service's hierarchy or single-object branch. `src/app/core/learning-object-module/learning-object/learning-object.service.ts` sends hierarchy PATCH requests to the centralized route in learning-object.routes.ts. The HTTP interceptor at `src/app/core/interceptor/httpconfig.interceptor.ts` adds bearer auth for environment.apiURL requests.

The gateway's `src/modules/clark/clark.router.ts` currently mounts HierarchydRouteHandler before the learning-object router. Its `hierarchy-module/hierarchy.router.ts` targets HIERARCHY_SERVICE_URI. Retarget this handler to CLARK_SERVICE_URI, update its route comments, and remove unused HIERARCHY_SERVICE_URI configuration imports/requirements/constant. Retain the route method, path, auth:true, query forwarding, and POST status dispatch.

## Plan of Work

Change submitHierarchy to accept selectedAuthorizations:string[] and optional submissionReason, and forward them with collection/status. Update the sole live caller in SubmitComponent to pass its existing form fields. Refresh the stale comments referring to Hierarchy Service docs. Keep releaseHierarchy's PATCH behavior and the existing URL unchanged.

Extend the learning-object service spec using HttpClientTestingModule/HttpTestingController with the real HttpConfigInterceptor and a CookieService stub. Cover hierarchy submission fields, empty consent, release requests, 204 handling, bearer headers, and retained single-object POST behavior. Add a focused component unit test in `src/app/onion/shared/submit/submit-hierarchy.spec.ts` for forwarding the form values without involving a real backend or browser navigation.

In the gateway, change only hierarchy dispatch and obsolete config dependencies, leaving the unrelated playlist edit untouched. No client route/guard/state/entity/environment or shared UI change is required.

### Follow-up: Fix Move to Review in the Builder

Update src/app/onion/learning-object-builder/builder-store.service.ts: reset savedCorrectly when fetch starts, mark it true only after an existing object has successfully loaded and been initialized, and replace the empty CHANGE_STATUS else/fallthrough with explicit rejections when saves are failed, pending, cached, or locally invalid. Status changes should call the existing POST service only when ready.

Update components/editor-action-panel/change-status-modal/change-status-modal.component.ts: remove its silent savedCorrectly guard, let the store report readiness errors, show a useful error, update the UI only after success, and release serviceInteraction in finally. Preserve the release/reject navigation and changelog behavior. Prevent duplicate confirms while a request is running.

Extend builder-store.service.spec.ts and add components/editor-action-panel/change-status-modal/change-status-action.spec.ts. Prove fresh-load status changes work without editing; failed fetches reset readiness; saves in progress, cached changes, invalid data, and failed saves are blocked without status or bundle calls; modal failures are visible/retryable; success closes the modal and updates status. Use the explicit Angular Jest transform described below.

## Concrete Steps

From clark-client:

    ./node_modules/.bin/jest --runInBand src/app/core/learning-object-module/learning-object/learning-object.service.spec.ts src/app/onion/shared/submit/submit-hierarchy.spec.ts
    ./node_modules/.bin/tsc --noEmit -p src/tsconfig.app.json

Run Prettier checks on the changed files. From CLARK-Gateway:

    ./node_modules/.bin/tsc --noEmit

Run focused ESLint/Prettier checks there. Inspect docker compose service mounts to confirm the edited gateway source is used by the running local container. Execute an authenticated request inside the gateway with a short-lived token and nonexistent user/object IDs; print only HTTP status/body, never credentials. Expect clark-service's Requester not found response and an obsolete status validation error, proving forwarding without mutating local data.

## Validation and Acceptance

Client tests must observe PATCH /learning-objects/:id/status through environment.apiURL with bearer auth and correct submission payload, and preserve POST status for individual objects. The form must forward exactly the chosen authorizations/reason. Gateway startup must no longer require HIERARCHY_SERVICE_URI. A live gateway PATCH must return the migrated backend's response rather than the old cookie-auth response.

Manual frontend test: sign in, submit a disposable author-owned hierarchy through the dashboard, and verify the PATCH on localhost:3000 returns 204; verify parent/child statuses after refresh. As admin/editor, release a hierarchy whose nodes are in review and have valid bundles. Release prerequisites remain those of clark-service.

## Idempotence and Recovery

Read-only checks and focused tests can be repeated. The proxy smoke test uses nonexistent identities/IDs and cannot mutate objects. Preserve unrelated work and avoid resets. Roll back only the named routing changes if needed; do not delete or restart the old hierarchy service as part of this task.

## Artifacts and Notes

No changes to hierarchy-service, backend business logic, deployment compose, client environment URLs, or authentication policy were made.

Validation:

- Seven focused tests passed: six service tests (hierarchy submission/release, consent, bearer headers, errors, and unchanged single-object POST) and one form forwarding test.
- Client `tsc --noEmit -p src/tsconfig.app.json`: passed.
- Gateway `tsc --noEmit`: passed.
- Focused client and gateway ESLint: passed.
- Live gateway smoke test: passed without local data mutations or printing credentials.
- Full Angular asset build was not run; src/env.js is absent in the existing checkout. App TypeScript compilation and focused Angular/Jest tests were used for this change.

The repository's default Jest transform uses ts-jest for HTML and failed on a carousel template while loading the form test. Both suites passed using an explicit jest-preset-angular transform with HTML stringification; no shared Jest configuration was changed. Reproduce from clark-client with:

```sh
./node_modules/.bin/jest --runInBand --config '{"preset":"jest-preset-angular","roots":["src"],"setupFilesAfterEnv":["<rootDir>/src/setup-jest.ts"],"moduleNameMapper":{"@env(.*)":"<rootDir>/src/environments/$1","@entity(.*)":"<rootDir>/src/entity/$1"},"modulePaths":["<rootDir>/src"],"transform":{"^.+\\.(ts|js|mjs|html|svg)$":["jest-preset-angular",{"tsconfig":"tsconfig.spec.json","stringifyContentPathRegex":"\\.(html|svg)$"}]}}' --runTestsByPath src/app/core/learning-object-module/learning-object/learning-object.service.spec.ts src/app/onion/shared/submit/submit-hierarchy.spec.ts --silent
```

Update note (2026-10-28): Gateway changes became authorized during this turn, superseding the initially considered client-only direct API override. No local API override was added. Gateway requests already use the new backend in the running source-mounted container.

## Interfaces and Dependencies

submitHierarchy will receive selectedAuthorizations:string[] and submissionReason?:string after its existing id/collection arguments. Existing response handling and Promise-based callers remain. Depend on the migrated backend PATCH API, existing CookieService/interceptor, and CLARK_SERVICE_URI in the gateway. No new packages or environment variables.

Follow-up update (2026-10-28): User reported Move to Review doing nothing and then authorized a fix after read-only diagnosis. Builder status readiness and modal error handling are now in scope; implemented and verified the fix with 24 focused tests across four suites.

Follow-up results (2026-10-28): A successful existing-object fetch now initializes savedCorrectly; a new/failed fetch clears it. CHANGE_STATUS rejects failed/invalid or pending/cached saves and cannot fall through to bundling. The modal shows readiness/backend errors, preserves the selected action for retry, prevents duplicate confirms, and always resets its busy state. Successful status changes retain dashboard navigation for release/reject and the existing changelog behavior.

Validation: 24 tests passed across builder-store.service.spec.ts, change-status-action.spec.ts, learning-object.service.spec.ts, and submit-hierarchy.spec.ts. The Builder's existing Set iteration fails with the repository's ES5 test target, so the focused Angular/Jest invocation used ES2016 with emitDecoratorMetadata; application compiler settings and shared test configuration were left unchanged. TypeScript app compilation and focused ESLint passed. Tests mock the status service; no local database records were changed.

To reproduce the four-suite test run from clark-client, use:

```sh
./node_modules/.bin/jest --runInBand --config '{"preset":"jest-preset-angular","roots":["src"],"setupFilesAfterEnv":["<rootDir>/src/setup-jest.ts"],"moduleNameMapper":{"@env(.*)":"<rootDir>/src/environments/$1","@entity(.*)":"<rootDir>/src/entity/$1"},"modulePaths":["<rootDir>/src"],"transform":{"^.+\\.(ts|js|mjs|html|svg)$":["jest-preset-angular",{"tsconfig":{"target":"ES2016","module":"commonjs","experimentalDecorators":true,"emitDecoratorMetadata":true,"esModuleInterop":true,"allowJs":true,"skipLibCheck":true,"baseUrl":"src","types":["jest","node"]},"stringifyContentPathRegex":"\\.(html|svg)$"}]}}' --runTestsByPath src/app/onion/learning-object-builder/builder-store.service.spec.ts src/app/onion/learning-object-builder/components/editor-action-panel/change-status-modal/change-status-action.spec.ts src/app/core/learning-object-module/learning-object/learning-object.service.spec.ts src/app/onion/shared/submit/submit-hierarchy.spec.ts --silent
```

Manual confirmation: reload an existing waiting object in the Builder, select Move to Review and Confirm without editing a field first. Expect one POST /learning-objects/:id/status; on success the object changes to review and the modal closes. When an edit is still saving or a save failed, expect a visible message and an available retry rather than a silent no-op.
