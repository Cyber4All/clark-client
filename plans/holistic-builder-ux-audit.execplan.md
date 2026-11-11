# Holistic Learning Object Builder UX Audit

## Purpose / Big Picture

Phase 1 audit and approved focused implementation slice for the CLARK Learning Object Builder journey. The current slice prioritizes Materials file-explorer clarity and the complete Generate with AI workflow. Broader Builder restyling remains staged.

## Progress

- [x] (2026-10-12) Read the task brief and required design skills.
- [x] (2026-10-12) Inspected builder routing, shell, navbar, Materials, upload/file browser, URLs, notes, Details, Outcomes, BuilderStore, and Agentic Builder components.
- [x] (2026-10-12) Reviewed the supplied current-state screenshots.
- [x] (2026-10-12) Produced the Phase 1 audit and prioritized findings.
- [x] (2026-10-12) Received approval to prioritize Agentic Builder and file explorer improvements, remove the unsupported Context control, clarify Bundle, and document rename/move limitations.
- [x] (2026-10-12) Implemented the approved Context removal, package-inclusion clarification, and deferred file-action TODOs.
- [x] (2026-10-12) Refined file action affordances, removed duplicate menu Download, renamed the package toggle, and repositioned/styled Generate with AI.
- [x] (2026-10-12) Renamed the package control to “Include in download” and disabled Generate with AI until source materials exist, with explanatory tooltip copy.
- [x] (2026-10-12) Validated the focused slice with Angular build and lint.

## Surprises & Discoveries

- The Builder is route-preserving and uses one scoped `BuilderStore`, which is a strong basis for a continuous authoring workflow.
- The UI is a mixed-generation system: standalone Angular components and custom RxJS state coexist with older NgModule imports, Font Awesome conventions, fixed column layout, and hand-rolled controls.
- Materials terminology is backed by separate behaviors: Bundle calls a file-service toggle, while Context mutates file context and saves the learning object. They should not be merged without product approval.
- The current file upload flow has progress and failure state, but the source contains a TODO for retrying failed files, so recovery is incomplete.
- The current file explorer exposes Download and Delete actions through the meatball menu. Rename, folder rename, and move are not implemented.
- The latest Agentic Builder drawer is materially calmer than the rest of the Builder, creating a visible style discontinuity rather than a shared system.

## Decision Log

- Decision: Stop the audit after Phase 1, then proceed with the user-approved focused implementation slice.
  Rationale: The user explicitly approved implementation after reviewing the audit and prioritized Agentic Builder and file explorer improvements.
  Date/Author: 2026-10-12 / Codex

- Decision: Recommend Preserve Brand with targeted structural evolution.
  Rationale: Routes, content model, save mechanisms, and CLARK blue identity are viable. The main debt is interaction continuity and visual inconsistency, not a need for a new architecture.
  Date/Author: 2026-10-12 / Codex

- Decision: Remove the Context control from the current authoring UI without changing the backend data model or route structure.
  Rationale: The backend cannot currently support the workflow reliably, and exposing a non-supported control is misleading.
  Date/Author: 2026-10-12 / Codex

- Decision: Reframe Bundle as a distribution-size control and keep Download/Delete as the current file actions.
  Rationale: Authors need to understand that Bundle controls inclusion in distributed learning-object zip files, especially for very large source files. Rename and move are explicitly deferred.
  Date/Author: 2026-10-12 / Codex

- Decision: Implement the focused Agentic Builder and file explorer changes before broader Builder visual unification.
  Rationale: The user identified these as the highest-value areas for this PR.
  Date/Author: 2026-10-12 / Codex

## Outcomes & Retrospective

Phase 1 delivered in chat. The approved focused slice is implemented. Broader Builder restyling remains deferred; rename/move and backend Context support remain follow-up work.

## Context and Orientation

Routes are `/materials`, `/info`, `/outcomes`, and `/outcomes/:id` under `LearningObjectBuilderComponent`. `BuilderNavbarComponent` owns the fixed shell and Generate with AI entry point. The route pages delegate edits to `BuilderStore`, which owns save queues and service interaction status. Materials delegates to upload, file-browser, URL, and notes components. Agentic generation calls `LearningObjectService.buildLearningObject`; review applies accepted values through existing store actions.

## Plan of Work

Implementation is now approved for the focused slice and should be staged as follows:

1. Remove unsupported Context UI and event wiring while preserving model compatibility.
2. Clarify Bundle semantics and document deferred file-management actions.
3. Improve Agentic Builder generation lifecycle and file explorer presentation within the existing stack.
4. Validate the focused source changes and manually verify the end-to-end authoring journey in a running app.

## Concrete Steps

Implementation steps are limited to the approved focused slice. Do not attempt rename, folder rename, move, backend contract changes, or a broad Details/Outcomes redesign in this PR.

## Validation and Acceptance

Acceptance requires the approved Context removal, clearer package-inclusion semantics, polished row actions without duplicate Download affordances, explicit rename/move TODOs, preserved Download/Delete behavior, and the existing Agentic review contract. Build passes; lint remains clean of errors with existing repository warnings. Browser walkthrough still requires manual verification in a running app.

## Idempotence and Recovery

The audit remains the baseline. Keep the focused implementation recoverable and avoid destructive changes to the existing route or data model.

## Artifacts and Notes

- Design Read: preserve-brand redesign for educators and instructional designers, using restrained editorial product UI within CLARK's existing Angular conventions.
- Dials: `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 3`, `VISUAL_DENSITY: 5`. The Builder is a focused application workflow, not a marketing surface.
- Existing theme: Source Sans Pro, white surfaces, CLARK blue `#1c70dd`, cool gray token family, frequent 1px borders, 4px radii, and several dark generic shadows/gradients.

## Interfaces and Dependencies

No interfaces, dependencies, routes, API contracts, or types were changed. Future work should continue using existing `BuilderStore`, `LearningObjectService`, `AgenticBuilderSuggestions`, `AgenticOutcomeSuggestion`, upload event outputs, and existing shared components unless an approved strategy says otherwise.
