# Add Jupyter notebook previews through nbviewer

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

After this change, an authenticated CLARK user can select Preview for a learning-object material whose filename ends in `.ipynb` and see the notebook rendered as static HTML through nbviewer in CLARK's existing `/preview/code` experience. Existing Office, PDF, and source-code previews continue to behave as before. The nbviewer base URL is environment configuration so CLARK can begin with the hosted service and later point production at a controlled deployment without changing preview logic.

## Progress

- [x] (2026-09-14 15:06Z) Read `PLANS.md`, inspected the shared preview route/component, core file preview dispatch, file icons, environments, and nearby tests.
- [x] (2026-09-14 15:06Z) Verified from the upstream nbviewer project that HTTPS source URLs use the `/urls/<host>/<path>` provider and that nbviewer fetches, renders, and caches notebook content server-side.
- [x] (2026-09-14 15:18Z) Added case-insensitive notebook classification, preview routing, and a code-style notebook file icon.
- [x] (2026-09-14 15:18Z) Added a configurable nbviewer base URL to each Angular environment.
- [x] (2026-09-14 15:18Z) Extended `CodePreviewComponent` to embed the configured nbviewer renderer for notebook requests while preserving source-code behavior.
- [x] (2026-09-14 15:18Z) Added focused component, service, and pure URL-builder tests.
- [x] (2026-09-14 15:18Z) Ran formatting, lint, two Angular builds, spec type-checking, an independent URL-builder check, and a live nbviewer signed-query request. Jest was attempted but blocked before test execution by the repository's existing transformer mismatch.
- [x] (2026-09-14 15:39Z) Added a 15-second notebook load timeout, iframe error handling, retry behavior, and direct-download actions for hosted nbviewer failures.
- [x] (2026-09-14 15:39Z) Re-ran app type-checking, formatting, diff checks, and an Angular build successfully; focused Jest remains blocked by the existing transformer mismatch.
- [x] (2026-09-14 16:08Z) Reverted an accidental Angular control-flow migration in 329 unrelated tracked files; retained only the notebook-preview changes and restored the preview template's existing `*ngIf` style.

## Surprises & Discoveries

- Observation: `CodePreviewComponent` is standalone and routed at `/preview/code`, while preview type dispatch is owned by `FileService.PREVIEW_ACTIONS`.
  Evidence: `src/app/clark.routing.ts`, `src/app/shared/modules/filesystem/code-preview/code-preview.component.ts`, and `src/app/core/learning-object-module/file/file.service.ts`.
- Observation: Learning-object file previews require a logged-in client, but Office previews already disclose the generated download URL to Microsoft's hosted viewer.
  Evidence: `src/app/shared/modules/filesystem/file-list-view/components/file-list-item/file-list-item.component.ts` and the `office` action in `FileService.PREVIEW_ACTIONS`.
- Observation: Hosted nbviewer fetches the remote notebook itself and caches rendered output; a source URL therefore must be reachable from nbviewer and must be safe to disclose to that service.
  Evidence: upstream `jupyter/nbviewer` URL provider and rendering handler.
- Observation: Test tooling is mixed: `angular.json` retains Karma configuration while the nearest component spec and root config support Jest.
  Evidence: `angular.json`, `jest.config.js`, and `code-preview.component.spec.ts`.
- Observation: Focused Jest execution currently fails during `setup-jest.ts` with `TypeError: configSet.processWithEsbuild is not a function`; the full spec type-check also reports unrelated stale-spec errors, while none remain in the new or modified specs.
  Evidence: `npx jest --runInBand ...` and `npx tsc -p src/tsconfig.spec.json --noEmit` on 2026-09-14.
- Observation: nbviewer accepts an encoded `/?<query>` path suffix and forwards the query to the source URL, which is required for presigned S3 URLs.
  Evidence: a live request to hosted nbviewer returned 200 after redirecting a public notebook URL with an encoded query parameter.
- Observation: A cross-origin iframe fires `load` when nbviewer successfully returns its own HTTP 429 or 503 error document, and the browser's same-origin policy prevents CLARK from reading that response status or page contents.
  Evidence: The preview iframe points at `nbviewer.org`, outside the CLARK origin; only transport-level iframe errors and a missing load event can be detected by this client component.
- Observation: `ng generate @angular/core:control-flow` changes both template syntax and companion directive imports across the application.
  Evidence: The accidental migration modified 335 tracked files before rollback; 329 unrelated files were restored to `HEAD`, while the notebook component was manually returned to its existing `*ngIf` convention.

## Decision Log

- Decision: Reuse the existing `/preview/code` route and shared `CodePreviewComponent` rather than add a parallel notebook route.
  Rationale: The component is already the new-tab preview shell and can choose its renderer from explicit route parameters without changing application routing.
  Date/Author: 2026-09-14 / Codex
- Decision: Configure `notebookViewerURL` per Angular environment, initially as `https://nbviewer.org`.
  Rationale: Hosted nbviewer provides the smallest usable integration, while configuration preserves a clean migration path to a controlled deployment.
  Date/Author: 2026-09-14 / Codex
- Decision: Treat notebook rendering as static preview only and do not execute notebook cells in CLARK.
  Rationale: This matches nbviewer and GitHub-style rendering and avoids introducing a notebook execution environment.
  Date/Author: 2026-09-14 / Codex
- Decision: Accept only HTTP(S) source URLs when constructing an nbviewer URL, and derive the trusted iframe origin solely from environment configuration.
  Rationale: The iframe requires Angular resource-URL trust; validating the source protocol and fixing the viewer origin limits misuse of that trust boundary.
  Date/Author: 2026-09-14 / Codex
- Decision: Treat a notebook iframe that has not loaded after 15 seconds, or emits an error event, as temporarily unavailable and show retry plus direct-download actions.
  Rationale: This gives users a CLARK-owned recovery path for network and service stalls. Because HTTP error pages inside a cross-origin iframe are opaque, the download action also remains visible during a loaded preview so users can recover from nbviewer-rendered 429/503 pages.
  Date/Author: 2026-09-14 / Codex

## Outcomes & Retrospective

`.ipynb` files are now previewable through the existing file-list and `/preview/code` flow. Notebook mode embeds a static nbviewer page, preserves signed source URL queries, rejects non-HTTP(S) inputs, hides code-only Copy controls, and adds no client dependency. The viewer endpoint is configurable across all Angular environments and currently points to hosted nbviewer. A stalled or failed iframe now resolves to a CLARK-owned temporary-unavailability message after 15 seconds with Try again and Download notebook actions; download also remains available when the iframe loads so users are not trapped by an nbviewer-rendered error page.

Angular build and lint pass. Lint retains 259 existing warnings and no errors. The URL builder was compiled and exercised independently, and its canonical signed-query form was verified against hosted nbviewer. Focused Jest specs were added but cannot execute until the repository's `jest-preset-angular`/`ts-jest` transformer mismatch is repaired. Manual validation with a real authenticated learning-object `.ipynb` remains recommended because a production presigned URL was not available in this workspace.

Hosted nbviewer is appropriate for an initial release only when notebook content is intended to be shared with a third-party renderer. If CLARK notebooks can be private, embargoed, licensed, or draft-only, use a controlled deployment before enabling production; protecting that deployment from arbitrary-URL SSRF and defining cache/retention policy are separate infrastructure work.

## Context and Orientation

`src/app/core/learning-object-module/file/file.service.ts` classifies extensions and dispatches preview actions. Source code currently opens `/preview/code` with `url`, `language`, and `filename` query parameters; Office files go to Microsoft Office Viewer and PDFs open directly. `src/app/shared/modules/filesystem/code-preview/code-preview.component.ts` consumes those parameters, downloads source text through `FileService`, and renders a fenced Markdown code block. Its template and SCSS provide the new-tab preview shell. `src/app/clark.routing.ts` already maps `/preview/code` to this standalone component, so no route addition is required.

`src/app/shared/modules/filesystem/file-list-view/components/file-list-item/file-list-item.component.ts` exposes the Preview button based on `FileService.canPreview()`. Adding `.ipynb` to the classifier makes that existing UI available without changing its public component contract. `src/app/shared/modules/filesystem/file-icons.ts` selects the icon displayed for each material.

This is a cross-cutting shared UI and core-service change. It does not change guards, interceptors, API contracts, state ownership, domain entities, or the route table. It does add an environment value but does not alter Angular file-replacement mechanics or CI deployment behavior.

## Plan of Work

Extend `FileService` with a `notebook` file category for `.ipynb`. Its preview action will open the existing preview route with an explicit notebook language/type marker and the source URL encoded as a query parameter. Add `.ipynb` to the existing code-like icon mapping.

Add `notebookViewerURL` to all four environment objects. Update `CodePreviewComponent` to distinguish notebook requests from source-code requests. For notebooks, parse and validate the source as HTTP(S), translate it to nbviewer's canonical `/url` or `/urls` provider URL, trust only that derived resource URL for an iframe, and present loading/error state in the existing shell. Hide code-only controls such as Copy for notebook previews. If the iframe errors or does not load within 15 seconds, replace it with a temporary-unavailability message and retry/download actions; retain direct download during a loaded preview because cross-origin HTTP error documents cannot be detected. Leave all current source-code fetching and Markdown rendering intact.

Expand the nearest component spec to cover source-code behavior, notebook URL construction, notebook template state, missing URLs, and invalid protocols. Add a focused `FileService` spec if none exists to verify `.ipynb` detection and preview dispatch without broad service refactoring.

Out of scope: provisioning ECS, adding JupyterHub authentication, changing S3 URL issuance, executing notebook cells, refactoring legacy Promise usage, or redesigning the shared preview system.

## Concrete Steps

From `/Users/luis/Code/development-environment/clark-client`:

    npx prettier --write plans/add-jupyter-notebook-preview.execplan.md src/app/core/learning-object-module/file/file.service.ts src/app/core/learning-object-module/file/file.service.spec.ts src/app/shared/modules/filesystem/code-preview/code-preview.component.ts src/app/shared/modules/filesystem/code-preview/code-preview.component.html src/app/shared/modules/filesystem/code-preview/code-preview.component.scss src/app/shared/modules/filesystem/code-preview/code-preview.component.spec.ts src/app/shared/modules/filesystem/code-preview/notebook-preview-url.ts src/app/shared/modules/filesystem/code-preview/notebook-preview-url.spec.ts src/app/shared/modules/filesystem/file-icons.ts src/environments/environment.ts src/environments/environment-experimental.ts src/environments/environment.staging.ts src/environments/environment.prod.ts

Expect formatting to complete without changing unrelated files.

    npx jest --runInBand src/app/shared/modules/filesystem/code-preview/code-preview.component.spec.ts src/app/shared/modules/filesystem/code-preview/notebook-preview-url.spec.ts src/app/core/learning-object-module/file/file.service.spec.ts

Intended result is that all focused preview tests pass. Current repository result is a transformer setup failure before test collection: `configSet.processWithEsbuild is not a function`.

    npx ng lint clark

Expect no new lint failures; document unrelated baseline failures if present.

    npm run build

Expect the Angular development build to complete and verify template/type integration. The command regenerates `src/commit-hash.ts`; preserve or report that expected generated change according to worktree state.

Manual validation: open a learning object with `.ipynb`, source-code, PDF, and Office materials while authenticated. Confirm notebook preview is enabled and renders a static nbviewer page in the preview shell; Copy is absent for notebooks; source-code Copy/rendering remains intact; PDF and Office behavior is unchanged. Confirm an unauthenticated user still cannot preview materials.

## Validation and Acceptance

Acceptance requires `.ipynb` to be recognized case-insensitively by `FileService.canPreview()`, Preview to open the existing CLARK preview route, and the page to embed the configured nbviewer rendering for valid HTTP(S) URLs. The iframe must have an accessible title and an appropriately constrained sandbox/referrer policy. Missing or unsupported URLs must show the existing error state rather than trusting or loading them. A transport error or 15-second load timeout must show the temporary-unavailability fallback with working Try again and Download notebook actions, and successful notebook previews must retain a direct download action.

Automated coverage must prove notebook/source branching, URL transformation for HTTPS and HTTP, query-string preservation, invalid-protocol rejection, `.ipynb` classification, and unchanged source-code rendering. A successful Angular build is the integration check for the standalone component template and environment replacements.

The external dependency acceptance caveat is explicit: hosted nbviewer can only fetch URLs available from its network, and using it discloses the notebook source URL and content to nbviewer infrastructure. Production use for private or embargoed learning-object materials requires a security decision before release.

## Idempotence and Recovery

Edits are additive and safe to repeat. If the component changes are incomplete, `.ipynb` should not be left in `FileService.canPreview()` because that would enable a nonfunctional Preview button; revert or finish the classifier and renderer together. Each environment must retain the same object shape so Angular file replacement does not create configuration-specific compile failures. No data migrations or destructive operations are involved.

## Artifacts and Notes

Upstream implementation references:

- `https://github.com/jupyter/nbviewer/` documents the hosted service, Docker image, configuration, and JupyterHub service authentication.
- `https://github.com/jupyter/nbviewer/blob/main/nbviewer/providers/url/handlers.py` shows `/url` and `/urls` remote URL handling.
- `https://github.com/jupyter/nbviewer/blob/main/nbviewer/providers/base.py` shows server-side notebook rendering and caching.

## Interfaces and Dependencies

- `FileService.canPreview(filename: string): boolean` gains `.ipynb` support.
- `FileService.previewLearningObjectFile(url: string, fileName: string): Promise<void>` dispatches notebook preview to `/preview/code`.
- `CodePreviewComponent` gains notebook-mode state, a derived `SafeResourceUrl`, a 15-second load timeout, retry/error handlers, and a validated source URL for direct download; its source-code public behavior remains intact.
- `environment.notebookViewerURL: string` selects hosted or self-managed nbviewer.
- External runtime dependency: an nbviewer-compatible HTTP service able to retrieve the supplied notebook source URL.
- No new npm dependency is planned.
