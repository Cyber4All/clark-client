# Preserve Docling partial content

## Purpose / Big Picture

Allow Docling's native two-minute conversion timeout to produce a real `partial_success` response with extracted content. The client must observe that response without first cancelling the backend job.

## Progress

- [x] (2026-10-14) Matched service eligibility using at least one success/partial_success material; kept polling remaining pending materials after generation becomes available.
- [x] (2026-10-14) Eligibility alignment validated with Angular build, Prettier, and git diff checks.

- [x] (2026-10-14) Allowed partial_success in both initial and polled generation readiness. Angular build, formatting, and diff checks passed; backend passed 8 generation unit tests and 3 targeted endpoint tests.

- [x] (2026-10-14) Traced the client deadline to the cancel endpoint and found that cancellation fences out the worker result.
- [x] (2026-10-14) Removed automatic cancellation, browser deadlines, and fabricated partial-success statuses; polling stops on actual terminal service statuses.
- [x] (2026-10-14) Client Angular build passed; backend verification passed 19 focused unit tests and 55 integration tests.

## Surprises & Discoveries

The browser starts its timer before Docling starts conversion, so its deadline can cancel the job before Docling returns partial content. The service also prematurely finalizes duplicate processing messages with empty partial content.

## Decision Log

- Decision: Compute generation readiness with some rather than every supported material, independently of polling completion.
  Rationale: The service generates from any usable successful or partially successful material and ignores failed/cancelled files. Pending materials still need status updates after generation becomes available. The status endpoint does not return content; the backend remains authoritative for checking extractedContent.
  Date/Author: 2026-10-14 / Codex

- Decision: Poll until the service reports a terminal conversion status and let `document_timeout: 120` bound the actual conversion.
  Rationale: A browser deadline cannot retrieve partial content from Docling. Polling must include the time needed to upload, queue, and return the result. Explicit user cancellation retains the existing API.
  Date/Author: 2026-10-14 / Codex

## Outcomes & Retrospective

The client no longer races Docling with an automatic cancel. It continues polling during conversion and publishes the actual terminal result. Angular compilation passed with an existing CommonJS querystring warning. Backend regression tests prove persistence and explicit cancellation behavior. Client runtime polling was reviewed but not exercised through a browser in this environment.

## Context and Orientation

`src/app/onion/learning-object-builder/components/builder-navbar/builder-navbar.component.ts` owns polling and publishes statuses through `FileService`. The shared processing indicator displays `partial_success` as Partial success. The sibling `clark-service` owns Docling requests and conditional persistence. No routing, authorization, environment, schema, or build configuration changes are needed.

## Plan of Work

Generation eligibility follow-up: treat success and partial_success as ready in the navbar. The sibling build component must accept both statuses with extracted content. Validate with Angular compilation and backend build unit/integration tests. No routing, environment, or authorization changes.

Remove browser deadlines and automatic cancel requests. Preserve the actual server status, including `cancelled`, and stop polling for success, partial_success, failure, and cancelled. Remove service expiry writes so only actual conversion results persist partial content. Keep explicit cancellation fenced.

## Concrete Steps

Run `npx ng build clark` and `git diff --check` from clark-client. Run focused Docling, file-metadata processing, and datastore unit suites with `test-config/unit.jest.json` from clark-service. The backend companion plan describes database integration validation.

## Validation and Acceptance

A conversion lasting past the browser's former deadline sends no automatic POST cancel request. The terminal GET response reports partial_success and the Parsing column shows Partial success. Failure and explicit cancellation stop polling. Client compilation must pass.

## Idempotence and Recovery

Edits are local and repeatable. No existing database records are rewritten; previously cancelled documents require reprocessing to recover content. Preserve unrelated worktree changes.

## Artifacts and Notes

The existing Jest setup has known transformer drift; use Angular compilation and focused backend coverage when client tests cannot run.

## Interfaces and Dependencies

Existing FileService processing-status and cancellation APIs remain intact. Poll lifetime remains bounded by component destruction and terminal server statuses.
