# Timeout Material Processing

Historical plan: the browser cancellation deadline described below is superseded by `plans/preserve-docling-partial-content.execplan.md`. The current implementation uses Docling's native conversion timeout and polls for the actual terminal status, preserving partial extracted content.

## Purpose / Big Picture

Bound material-processing polling to two minutes. When a supported document remains unfinished beyond that limit, the builder must stop polling it, show `Timed out` in the Parsing column, and request backend cancellation so the document is not left processing indefinitely.

## Progress

- [x] (2026-10-14) Located the polling owner in `builder-navbar.component.ts` and the shared Parsing indicator.
- [x] (2026-10-14) Confirmed the client currently has only a processing-status GET route.
- [x] (2026-10-14) Confirmed `clark-service` has no cancellation route and its worker can mark an in-flight parse ready after a client-side timeout.
- [x] (2026-10-14) Implemented the backend cancellation contract in `clark-service` and `CLARK-Gateway`.
- [x] (2026-10-14) Added the two-minute client timeout, one-shot cancellation request, and timed-out status publication.
- [x] (2026-10-14) Rendered `Timed out` in the Parsing column.
- [x] (2026-10-14) Ran client and backend compilation/formatting validation; focused backend datastore coverage passed.

## Surprises & Discoveries

- The client polls from `BuilderNavbarComponent.watchMaterialProcessing()` every five seconds.
- `FileProcessingIndicatorComponent` derives labels from the shared `FileService.fileProcessingStatuses$` map.
- The backend currently has `GET /learning-objects/:learningObjectId/materials/files/:fileId/processing-status`, but no cancel operation.
- A frontend-only timeout would not stop backend work: `processFileMetadataDocument()` can continue through `doclingDriver.parseMaterial()` and then call `markFileContentReady()`.
- The backend's existing stale-processing recovery threshold is one hour, which is unrelated to the requested two-minute user-facing timeout.

## Decision Log

- Decision: Keep polling ownership in the builder navbar and status rendering in the shared indicator.
  Rationale: This preserves the existing single-poller architecture and keeps the Parsing column request-free.
  Date/Author: 2026-10-14 / Codex
- Decision: Do not invent a client-only cancellation success state.
  Rationale: The current backend contract cannot stop or invalidate an in-flight parse, so the client must coordinate with a backend cancellation contract.
  Date/Author: 2026-10-14 / Codex

## Outcomes & Retrospective

Implemented the end-to-end timeout path. The client keeps independent deadlines per parseable file, stops polling timed-out files, and maps backend cancellation responses to the user-facing `Timed out` state. The backend uses conditional persistence updates to prevent a canceled in-flight worker from publishing ready or failed content.

## Context and Orientation

Client polling is in `src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.ts`. It calls `FileService.getFileProcessingStatus()` and publishes status maps. The Parsing column is implemented by `src/app/shared/modules/filesystem/file-list-view/file-processing-indicator/` and summarizes file or folder states. Client routes and HTTP methods are in `src/app/core/learning-object-module/file/file.routes.ts` and `file.service.ts`.

The backend implementation is in sibling repositories: `../clark-service` owns file-content processing and `../CLARK-Gateway` proxies routes. Backend cancellation must authorize access, identify the file metadata and storage revision, prevent queued work from starting, and prevent an in-flight worker from publishing ready content after cancellation. The current workspace write scope is the client repository, so backend edits require explicit workspace access/approval.

This change does not touch routing guards, interceptors, environments, or unrelated builder state. It changes an API contract, polling state, and shared UI status labels.

## Plan of Work

1. [x] Add a backend cancel operation and gateway proxy route with a terminal `cancelled` state and conditional worker completion.
2. [x] Add a typed client cancellation method and invoke it once per file when its two-minute deadline expires.
3. [x] Track polling deadlines per file, stop polling timed-out files, and publish `timed_out` to the existing status map.
4. [x] Add Parsing indicator rendering and folder-summary behavior for timed-out descendants.
5. [x] Validate both repositories; the existing broad backend file-metadata unit suite still has two unrelated pre-existing failures.

## Concrete Steps

- Confirm the backend cancellation status name and route shape.
- Edit the backend service/datastore, gateway route list, client route helper/service, navbar poll, indicator, and tests.
- Run client formatting, TypeScript/template compilation, Angular build, and focused tests where the repository Jest transformer permits.
- Run backend unit and integration tests for cancellation and worker race behavior.

## Validation and Acceptance

- A pending/processing supported file polls normally for at most 120 seconds.
- At timeout, the Parsing column says `Timed out`, the client sends exactly one cancellation request for that file, and no further status polls occur for it.
- A canceled backend job cannot later overwrite the file content with `ready`.
- Other files continue polling independently; folders summarize timed-out children without reporting `Ready`.
- New uploads or explicit invalidation start a fresh timeout window.
- Authorization and file-membership checks match the existing processing-status endpoint.

## Idempotence and Recovery

Cancellation requests are safe to repeat and terminal-state aware. Client teardown cancels timers/subscriptions without sending cancellation for files no longer owned by the active builder. Backend edits preserve unrelated dirty worktree changes.

## Artifacts and Notes

Existing related plans: `plans/poll-material-processing-status.execplan.md` and `plans/material-parsing-status-column.execplan.md`.

## Interfaces and Dependencies

The client depends on the authenticated backend cancellation endpoint and the `cancelled` status value. The gateway proxies the endpoint. The backend worker and file-content datastore share the cancellation semantics.
