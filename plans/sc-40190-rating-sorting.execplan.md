# SC-40190: Reliable Browse rating sorting

This ExecPlan follows PLANS.md.

## Purpose / Big Picture

Browse supports ascending and descending average rating with stable pagination, URL restoration, and text search.

## Progress

- [x] (2026-11-23) Inspected client query flow, backend aggregation, repository guidance and test configuration.
- [x] (2026-11-23) Implemented rating sort options, URL hydration, search preservation and page reset behavior.
- [x] (2026-11-23) Added focused Browse/search/request-serialization tests and passed the production build.

## Surprises & Discoveries

SearchComponent unconditionally changes orderBy to none. Backend rating sort has no unique tie-breaker. Existing client default Jest config overrides the Angular transformer; the ratings-specific config provides a working pattern.

## Decision Log

- Decision: Stabilize existing components and add \_id as the backend rating tie-breaker.
  Rationale: Equal rating objects must paginate consistently without changing ranking by review count.
  Date/Author: 2026-11-23 / Codex
- Decision: Preserve rating selections during text search while retaining legacy relevance behavior for other sorts.
  Rationale: Meet rating requirements without changing date/download search behavior.
  Date/Author: 2026-11-23 / Codex

## Outcomes & Retrospective

Completed the client portion. Rating sorts persist through URL navigation, filters, pagination and text search. The backend tie-breaker is maintained in the separate service branch.

## Context and Orientation

Client src/app/cube/browse/browse.component.ts reads route parameters, calls SearchService and renders results. src/app/components/search/search.component.ts navigates from the search bar. Backend src/shared/aggregations/search-learning-objects.builder.ts computes averageRating, sorts, then skips and limits results.

## Plan of Work

Keep rating menu changes, derive labels during query hydration, explicitly reset pagination on sort changes, and preserve rating on search. Keep public Browse released-only. Add backend deterministic tie ordering on a separate feature branch. Test query navigation, URL hydration, search preservation, and real MongoDB rating pagination.

## Concrete Steps

Client: run node_modules/.bin/jest --config jest.browse.config.js --runInBand.
Service: run npm run test:e2e -- --runTestsByPath src/tests/integration/learning-object-module/sorting.e2e.spec.ts --coverage=false.

## Validation and Acceptance

Both rating directions produce correct query parameters and restored labels. Changing sort resets page 1; pagination retains filters. Requests never contain rejected. MongoDB tests include equal, unequal and missing ratings, assert unique objects and correct ordering across pages. Manually check mobile menu and browser history.

## Idempotence and Recovery

Tests are repeatable and use mocks or a disposable MongoDB. Preserve existing user changes. No deployments or database migrations are required.

## Artifacts and Notes

Validation: `node_modules/.bin/jest --config jest.browse.config.js --runInBand` passed 15 tests; `npm run lint` passed with 270 pre-existing warnings; `npm run build` passed.

## Interfaces and Dependencies

No guards, interceptors, entities, API shape, environment or production build changes. Shared search bar behavior changes only for explicit rating sorting. Test configuration is isolated to this feature; existing Angular/Jest debt remains.
