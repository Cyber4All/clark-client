# Migrate Coralogix RUM to Sentry

## Purpose / Big Picture

Replace the remaining legacy Coralogix runtime observability integration with Sentry equivalents after the Sentry setup script has already added the SDK wiring. User-facing app behavior should not change. Observability behavior should move from the old RUM wrapper to direct Sentry SDK calls for user context, tags, custom events, feedback, logs, and handled errors.

## Progress

- [x] 2026-07-21 10:58:53 EDT - Read repository planning guidance and confirmed an ExecPlan is required because observability is cross-cutting.
- [x] 2026-07-21 10:58:53 EDT - Located all runtime references to the legacy RUM wrapper and browser SDK package.
- [x] 2026-07-21 11:02:57 EDT - Replaced legacy application initializer and runtime service usage with Sentry SDK calls.
- [x] 2026-07-21 11:02:57 EDT - Removed obsolete legacy runtime package/script metadata and source-map upload wiring.
- [x] 2026-07-21 11:02:57 EDT - Validated with focused searches and TypeScript no-emit; Angular build still aborts under local Node 24 before emitting diagnostics.
- [x] 2026-07-21 11:02:57 EDT - Removed the generated Sentry sample component after lint identified it as non-conforming; lint now exits successfully with existing warnings.

## Surprises & Discoveries

- The Sentry setup script has already modified `src/main.ts`, `package.json`, `package-lock.json`, `angular.json`, and `.gitignore`, and added `src/app/sentry-example.component.ts`.
- The legacy RUM wrapper is used only by startup, auth user context, chatbot error tracking, and chatbot feedback telemetry.
- `src/app/shared/modules/chatbot/chatbot-window/chatbot-window.component.ts` imports `CoralogixLogSeverity` solely to send an info-level feedback log.
- `npm install --package-lock-only --ignore-scripts` succeeded but warned that the local shell uses Node 24.14.0 while the project requires Node 22.13.1.
- `npm run build` exits with code 134 after starting Angular bundle generation under local Node 24.14.0, even with `NODE_OPTIONS=--max-old-space-size=4096`; `npx tsc --noEmit --project src/tsconfig.app.json` passes.
- The Sentry wizard sample component violated local Angular lint naming rules and was not referenced by the app, so it was removed.

## Decision Log

- Use direct `@sentry/angular` imports rather than creating a new wrapper service because `main.ts` already initializes Sentry directly and the replacement surface is small.
- Map Coralogix user context to `Sentry.setUser` and role/organization metadata to `Sentry.setTags` / `Sentry.setContext`.
- Map chatbot handled HTTP failures to `Sentry.captureException`.
- Map chatbot feedback to `Sentry.captureFeedback` / `Sentry.captureMessage` so rating and text are preserved without using Sentry performance measurements.

## Outcomes & Retrospective

Runtime observability references now use Sentry directly. The old wrapper service and obsolete integration document were deleted. Coralogix npm scripts, dependency metadata, and CircleCI source-map upload commands were removed or replaced with the Sentry source-map upload script.

Validation completed with focused full-repo searches, `npx tsc --noEmit --project src/tsconfig.app.json`, and `npm run lint`. Lint exits successfully but still reports pre-existing warnings unrelated to this migration.

## Context and Orientation

This is a single Angular 18 SPA using Angular CLI/application builder and mostly NgModule-oriented patterns. The relevant files are:

- `src/main.ts`: application bootstrap and current Sentry initialization.
- `src/app/core/services/coralogix-rum.service.ts`: existing legacy wrapper service.
- `src/app/core/auth-module/auth.service.ts`: login/logout session ownership and observability user context.
- `src/app/core/chat-module/chatbot.service.ts`: chatbot API request and handled error tracking.
- `src/app/shared/modules/chatbot/chatbot-window/chatbot-window.component.ts`: chatbot feedback telemetry.
- `package.json` and `package-lock.json`: observability SDK and source map upload dependencies/scripts.

The work is cross-cutting because it touches startup, a core auth service, a core API service, shared chatbot UI code, and dependency metadata. It does not intentionally touch routing, guards, interceptors, shared UI contracts, API contracts, form patterns, or application state ownership.

## Plan of Work

1. Remove the legacy RUM initializer from `src/main.ts` providers because Sentry is initialized directly before bootstrap.
2. Replace auth user context methods with Sentry user, context, and tags.
3. Replace chatbot handled error tracking with Sentry exception capture.
4. Replace chatbot feedback measurement/logging with Sentry measurement, feedback, and message capture.
5. Remove the unused Coralogix service file and package metadata if no runtime imports remain.
6. Run focused validation searches and a build/type check if the local dependency state permits.

## Concrete Steps

- Edit `src/main.ts` to remove `APP_INITIALIZER` and the legacy RUM provider.
- Edit `src/app/core/auth-module/auth.service.ts` to import Sentry and update `setRumUserContext` / `clearRumUserContext`.
- Edit `src/app/core/chat-module/chatbot.service.ts` to import Sentry and remove the Coralogix constructor dependency.
- Edit `src/app/shared/modules/chatbot/chatbot-window/chatbot-window.component.ts` to import Sentry and remove Coralogix imports/injection.
- Delete `src/app/core/services/coralogix-rum.service.ts` if it becomes unused.
- Remove Coralogix package scripts/dependency from `package.json`; update `package-lock.json` through npm tooling if possible.

## Validation and Acceptance

- `rg -n "legacy RUM wrapper symbols and package names" src package.json package-lock.json .circleci/config.yml` should show no runtime/package references.
- TypeScript no-emit should confirm the new Sentry imports and call signatures compile.
- Existing app behavior should remain unchanged except observability events now go to Sentry.

## Idempotence and Recovery

All edits are local and mechanical. If interrupted, rerun the focused searches above to identify remaining Coralogix references and continue replacing them. Do not revert unrelated unstaged Sentry setup changes from the setup script.

## Artifacts and Notes

Removed the obsolete legacy RUM integration document because it contained setup commands and import examples for deleted code.

## Interfaces and Dependencies

- Uses `@sentry/angular` already present in `package.json`.
- Removes runtime dependence on the legacy browser observability package.
- Keeps Sentry source map upload script added by the setup script.
