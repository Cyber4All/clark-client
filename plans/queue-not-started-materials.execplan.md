# Automatically queue materials whose parsing has not started

This living ExecPlan follows PLANS.md.

## Purpose / Big Picture
Automatically queue supported materials when the existing processing-status endpoint would report not_started. The user's follow-up supersedes the manual retry button and POST route.

## Progress
- [x] (2026-11-02) Inspected client polling, backend processing, and local MongoDB schema, samples and indexes.
- [x] (2026-11-02) Implemented initial automatic recovery in clark-service; superseded by the simplification below.
- [x] (2026-11-02) Validated the initial implementation (44 unit and 64 integration tests); revised implementation validation pending.
- [x] (2026-11-02) Removed reservation/release helpers and reused queued upsert followed by SQS dispatch, as requested.
- [x] (2026-11-02) Updated tests: 38 unit tests and 63 integration tests pass. TypeScript compilation and touched-file ESLint pass; touched code formatted with Prettier.

## Surprises & Discoveries
not_started is synthesized when no current-revision content record exists. Workers require queued content before consuming SQS. Local data contains legacy ready statuses. 

## Decision Log
- Decision: Recover through the existing authenticated status endpoint and preserve its authorization.
  Rationale: User requested automatic recovery; client and gateway changes are unnecessary.
  Date/Author: 2026-11-02 / Codex
- Decision: Reuse the upload flow of queued upsert followed by SQS dispatch; remove the reservation and cleanup helpers.
  Rationale: User explicitly requested simpler code without these edge-case guardrails.
  Date/Author: 2026-11-02 / Codex

## Outcomes & Retrospective
Simplification complete at user request: the status method reuses upsertQueuedFileContent followed by sendFileProcessingMessage, matching the upload flow. Removed both added datastore methods and their interface declarations, mocks and reservation tests. Existing statuses and unsupported files remain unchanged. No client button, endpoint or gateway changes.

## Context and Orientation
Client BuilderNavbarComponent and FileService poll GET /learning-objects/:learningObjectId/materials/files/:fileId/processing-status. In sibling clark-service, src/modules/file-module/metadata/file-metadata.component.ts authorizes requests, looks up the file/revision and returns not_started for missing content. FileContentDatastore owns persistence; SQSDriver dispatches existing file/learning-object messages. The worker claims queued records. No Angular routing, guards, shared UI, model, state ownership, build or environment changes are needed.

## Plan of Work
Reuse upsertQueuedFileContent in getFileProcessingStatus when a supported current revision has no content. Then call sendFileProcessingMessage and return queued. Remove reserveMissingFileContent and releaseQueuedFileContent from the datastore, interface and test mocks. Remove concurrency/reservation/rollback tests; retain status dispatch, existing-state, unsupported-file, authorization and membership coverage.

## Concrete Steps
In clark-service run npm run test:unit -- --runTestsByPath src/tests/unit/file-module/file-metadata.unit.spec.ts src/tests/unit/datastores/file-content.unit.spec.ts --coverage=false; npm run test:e2e -- --runTestsByPath src/tests/integration/file-module/file-metadata.e2e.spec.ts --coverage=false; node node_modules/typescript/bin/tsc --noEmit.

## Validation and Acceptance
Supported missing content is persisted as queued before the SQS message is sent and reported as queued. Subsequent sequential polls do not send again. Unsupported files and all existing statuses remain unchanged. Authorization and membership checks precede queueing. Test queue-send errors propagate using the existing API error path.

## Idempotence and Recovery
Existing content is left unchanged. This deliberately follows the upload path: queued upsert then SQS send, without concurrent-request reservation or queue-failure rollback. No application database migration or writes through MCP are required.

## Artifacts and Notes
Inspected local_mongo at localhost:27017, file-service.file-content, projecting processing metadata only. Confirmed compound fileMetadataId/storageRevision index. Record validation results here before handoff.

Validation after simplification: both focused unit suites passed (38 tests); the full file-metadata integration suite passed (63 tests) against in-memory MongoDB. Coverage includes automatic dispatch, no repeat send on subsequent polls, existing statuses, unsupported files, authorization and file membership. TypeScript --noEmit and touched-file ESLint passed; Prettier formatted touched code. No live SQS or application database writes were used.

## Interfaces and Dependencies
FileMetadataComponent, IFileContentDatastore, FileContentDatastore, FileContentModel, existing unique file/revision index and SQSDriver. Backend execution plan mirrors this file. No new external dependency.
