# Agentic Builder Material Eligibility

## Purpose / Big Picture

Keep Generate with AI disabled until current learning-object materials include a supported file whose current file-content processing status is success or partial_success. Query the existing status endpoint and retain the backend build endpoint's final validation.

## Progress

- [x] (2026-10-27) Inspect navbar enablement and backend Docling support/readiness filters.
- [x] (2026-10-27) Restrict button enablement, update its guidance, guard panel opening, and close it when material updates leave no supported files.
- [x] (2026-10-27) Add focused supported/unsupported/mixed/empty material eligibility tests and inspect editor diagnostics. Test execution was declined; automated and browser validation remain unperformed.
- [x] (2026-10-27) Inspect the existing backend processing-status endpoint and confirm READY serializes as success, not ready.
- [x] (2026-10-27) Add typed status access and readiness polling in FileService, with request timeout and cancellation.
- [x] (2026-10-27) Wire navbar enablement to confirmed readiness and clear stale readiness on material changes.
- [x] (2026-10-27) Fifteen service readiness tests pass. New code has no editor errors; navbar tests could not load because the repository Jest transform fails on imported HTML. Retry was declined. Live browser validation has not been performed.
- [ ] Stop retrying permanent status HTTP errors such as 404 while retaining readiness checks for other supported files.

## Surprises & Discoveries

The initial frontend change checked file types only. Further backend inspection found GET /learning-objects/:learningObjectId/materials/files/:fileId/processing-status. It returns fileId, storageRevision, processingStatus, and optional lastUpdatedDate, looking up file content for the current metadata revision. Status values are queued, processing, success, failure, cancelled, partial_success, and not_started. The status endpoint does not return extracted content. The build endpoint still requires nonempty extracted content. Supported extensions are docx, html, md, pdf, pptx, txt, and xlsx.

## Decision Log

- Decision: Use the existing processing-status endpoint for each supported material and poll every five seconds, avoiding overlapping requests.
  Rationale: File presence and supported extension do not establish readiness. No new backend endpoint is necessary.
  Date/Author: 2026-10-27 / Codex
- Decision: Accept success and partial_success; treat other statuses and request errors as not ready. Reset readiness and cancel obsolete requests when material identity/revision changes or the navbar is destroyed.
  Rationale: Match the backend's status semantics and prevent stale responses from enabling generation for a different material set.
  Date/Author: 2026-10-27 / Codex
- Decision: Stop polling a file after permanent HTTP 4xx errors, excluding retryable 408 and 429 responses. Stop the timer if no queryable files remain; material changes or a new subscription can retry.
  Rationale: A 404 is not a processing state. Backend missing file-content returns 200/not_started; retrying an unavailable route or missing metadata indefinitely creates request noise.
  Date/Author: 2026-10-27 / Codex

## Outcomes & Retrospective

The button now requires a supported file and confirmed current processing status success or partial_success. FileService polls every five seconds with non-overlapping requests until a ready material is found, cancels obsolete checks on file/revision changes, and stops polling on unsubscribe. Missing, queued, processing, failed, cancelled, and inaccessible content stay disabled. Fifteen focused service regressions passed. Navbar integration tests could not load because of existing Jest HTML transform drift; retry was declined. Editor diagnostics show no errors in the new code, while the navbar's existing field initialization and optional boolean diagnostics remain. Live UI/API validation has not been performed.

## Context and Orientation

The navbar receives material metadata through BuilderStore events. FileService will own supported-file matching, status HTTP requests, and readiness polling; the navbar subscribes and renders the result. Add a route helper and file-processing status types under src/app/core/learning-object-module/file/. Add optional storageRevision to the existing LearningObject.Material.File type for material change detection. No routing, auth, shared UI, backend, environment, or build changes. Legacy Promise-based unrelated file methods remain unchanged.

## Plan of Work

Keep the extension gate and add confirmed readiness through FileService. Snapshot file IDs and revisions on material events, skip identical snapshots, cancel polling on changes, and emit false before checking a new set. Poll supported files only; enable when at least one returns success or partial_success. Explain processing/unavailable states in the disabled tooltip. Add focused regressions without rewriting unrelated navbar tests.

## Concrete Steps

1. Add status types and GET route/method in the existing FileService area.
2. Implement cancellable readiness polling in FileService and subscribe from the navbar.
3. Update focused service/navbar specs; inspect editor diagnostics. If authorized, run Jest with explicit Angular transformer and source module path overrides.

## Validation and Acceptance

Empty files, URLs only, FLAC, and other unsupported files stay disabled. Supported files remain disabled while queued, processing, failed, cancelled, not_started, or status requests fail. A current supported file with success or partial_success enables the button. Polling observes queued-to-success changes. Removing or replacing files resets readiness and obsolete responses cannot enable the button. Destruction stops polling. The build endpoint independently checks nonempty extracted content because the status response does not expose content.

## Idempotence and Recovery

Read-only eligibility checks do not modify uploads. Repeat checks safely after material changes. Keep the backend validation unchanged.

## Artifacts and Notes

The navbar component/template/spec, FileService/routes/status types/specs, LearningObject file metadata type, and this plan.

Regression command from repository root:

    node node_modules/jest/bin/jest.js --runInBand --no-cache --modulePaths ./src --transform '{"^.+\\.(ts|js|html)$":"jest-preset-angular"}' --runTestsByPath src/app/core/learning-object-module/file/file.service.spec.ts src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.spec.ts --testNamePattern 'AI material'

Result: 15 service tests passed; navbar suite failed to load imported HTML (Unexpected token '<'). An explicit full Angular transform configuration was proposed for retry but execution was declined. No repository-wide Jest configuration was changed.

## Interfaces and Dependencies

Existing file extension metadata is the source of type. Keep the allowlist synchronized with Docling. The status endpoint uses authenticated credentialed GET requests and resolves the current revision server-side. Existing Jest config needs Angular transformer and module path overrides.
