# Two-tab profile using existing contribution retrieval

This ExecPlan is maintained in accordance with `PLANS.md`. Only clark-client may be edited.

## Purpose / Big Picture

Show exactly Contributions (initially selected) and Public Playlists. Reuse the original profile contribution retrieval and display its results as a flat list. The only added data flow is fetching the viewed user's public playlists using GET /playlists?userId=..., then linking playlist cards to their existing dedicated routes. Preserve the separately requested download-count fix. Remove copy controls and the newly introduced search/Browse behavior.

## Progress

- [x] (2026-10-26 18:11Z) Resolved seven merge conflicts; six focused suites / 22 tests and Angular build passed. Preserved flat contributions, user-scoped public playlists, encoded metrics parameter and unrelated incoming work.

- [x] (2026-10-26) Reviewed current diff and original profile retrieval in HEAD; confirmed new author search and Browse logic can be removed entirely.
- [x] (2026-10-26) Restored SearchService, Browse and Query to HEAD and deleted the workaround-only search spec.
- [x] (2026-10-26) Restored original metadata/released-object retrieval and partial-success behavior; kept the flat list and two accessible tabs.
- [x] (2026-10-26) Playlist requests use the viewed userId, with public visibility filtered once in the service.
- [x] (2026-10-26) Six suites pass (22 tests), Angular build passes, diff whitespace check passes, and SearchService/Browse/Query have no diff from HEAD.

## Surprises & Discoveries

- Original user-profile code already produced allUserContributions as a flat array. Only the child presentation component grouped it by collection.
- SearchService identity resolution, paged author retrieval and full-result intersection were unnecessary for this revised scope.
- Existing GET /playlists accepts userId. Owner responses may contain private entries; retain a single public-visibility filter in PlaylistService.
- Existing default Jest config fails during transformer setup. Temporary configuration using installed jest-preset-angular and ES2016 test target previously ran the focused suites successfully.

## Decision Log

- Decision: Reuse getUserSubmittedCollections(username), filter released metadata, fetchLearningObject(cuid, version), and Promise.allSettled as before.
  Rationale: User explicitly requested original retrieval without collection grouping.
  Date/Author: 2026-10-26 / Codex
- Decision: Remove the View all contributions link and all new Browse/SearchService/Query changes.
  Rationale: The tab already lists all contributions; the latest instruction limits new retrieval logic to public playlists. Keeping the link would depend on the removed author-filter behavior and show misleading results.
  Date/Author: 2026-10-26 / Codex
- Decision: Query GET /playlists with userId; filter visibility once in PlaylistService.
  Rationale: Reuse existing backend owner selection, avoid loading all users' playlists, and avoid duplicate component filtering.
  Date/Author: 2026-10-26 / Codex
- Decision: Retain the separately requested metrics query-parameter correction.
  Rationale: Fixes every learning-object card receiving the site-wide download count; explicitly requested after the profile work.
  Date/Author: 2026-10-26 / Codex

## Outcomes & Retrospective

Scope reduction complete. Contributions use the same two existing services and released-object/Promise.allSettled flow as before, with flat presentation. All new author-search retrieval, Browse changes, author Query field, dependent Browse link and workaround test are removed. The only added retrieval flow is user-scoped public playlists. The separately requested metrics query fix remains. Six suites pass (22 tests); Angular build and whitespace checks pass. Earlier author-search and sharing requirements are superseded by the latest user instructions. No backend files were edited during this change. Existing unrelated backend working-tree content was left untouched.

## Context and Orientation

src/app/cube/user-profile/user-profile.component.ts receives the resolved user and coordinates existing CollectionService and LearningObjectService calls. Its profile-learning-objects child displays the array without collection tabs. Material tabs provide keyboard navigation. PlaylistService and playlist.routes/types own the only new retrieval API: GET /playlists?userId=<viewed ID>. Reuse existing PlaylistCardComponent routes. Keep independent loading/empty/failure states and route subscription cleanup. No routing, guards, interceptors, environment or build configuration changes. SearchService, Browse and Query are restored to their original implementations.

## Plan of Work

Remove the earlier search/Browse workaround and related tests. Restore the original contribution flow inside the existing profile loading/error lifecycle, retaining partial-success behavior for individual object fetches. Remove the Browse link because contributions are already complete. Extend the existing playlist query helper/type with userId; fetch only that user's playlists and filter public visibility in the service. Update tests to cover original retrieval, released-only selection, partial failures, flat UI, two tabs, state handling, navigation, user-scoped playlists and dedicated playlist links.

## Concrete Steps

From clark-client run focused Jest using /private/tmp/clark-profile-jest.cjs for user-profile, playlist.service, metric.service and existing playlist page/card specs. Run npx ng build clark and git diff --check. Compare SearchService/Browse/Query with HEAD to prove they are unchanged. Inspect git -C ../clark-service status --short read-only.

## Validation and Acceptance

Profile tests must prove metadata is requested for the viewed username, only released entries are fetched by CUID/version, all fulfilled fetches appear together irrespective of collection, and collection tabs/Browse link/copy controls are absent. Keep both tab labels/default/keyboard behavior, independent loading/empty/failure/retry states, direct profile navigation and stale-response protection. Playlist HTTP tests verify encoded userId, public visibility filtering, no foreign-owner entries and unchanged existing list/detail requests. Metrics tests retain distinct object counts and scoped date-range requests. No author-filter acceptance is claimed in this narrowed scope.

## Idempotence and Recovery

Restore only the known agent-authored diff and its new workaround spec; preserve other user changes and the requested metrics fix. No migration or backend writes. Tests use mocks and are safe to repeat.

## Artifacts and Notes

Validation: six suites / 22 tests passed, including original released-only contribution retrieval, cross-collection flat presentation, successful objects retained after an individual failure, tab keyboard behavior, state/retry handling, stale profile responses, user-scoped playlist requests/public filtering, existing playlist consumers and metrics regression coverage. `npx ng build clark` passed with the existing CommonJS querystring warning. `git diff --check` passed. No manual browser/live-API validation was performed.

Temporary Jest workaround: load repository jest.config.js, replace transform with jest-preset-angular configured with a tsconfig extending src/tsconfig.spec.json at target ES2016, and map ^app/(.*)$ to src/app/$1. Production build config remains unchanged. Existing querystring CommonJS warnings may remain.

## Interfaces and Dependencies

Existing CollectionService.getUserSubmittedCollections and LearningObjectService.fetchLearningObject retain their contracts. Add optional GetPlaylistsQuery.userId and PlaylistService.getPublicPlaylists(userId). Playlist remains the source-of-truth shape. Profile presentation owns no API requests. Reuse Angular Material MatTabsModule and existing RouterLink within playlist cards.


Focused command executed from clark-client:

```sh
npx jest --config /private/tmp/clark-profile-jest.cjs --runInBand src/app/cube/user-profile/user-profile.component.spec.ts src/app/core/playlist-module/playlist.service.spec.ts src/app/core/metric-module/metric.service.spec.ts src/app/cube/playlists/playlists.component.spec.ts src/app/cube/playlists/playlist-details/playlist-details.component.spec.ts src/app/cube/playlists/components/playlist-card/playlist-card.component.spec.ts --silent
```

The temporary config is outside the repository; it extends the installed test setup and avoids changing project tooling. To recreate it, save a JSON tsconfig at `/private/tmp/clark-profile-tsconfig.json` extending the absolute repository path `/src/tsconfig.spec.json` with `compilerOptions.target` set to `ES2016`. Save this CommonJS config at `/private/tmp/clark-profile-jest.cjs`:

```js
const root = process.cwd();
const config = require(root + '/jest.config.js');
module.exports = {
  ...config,
  rootDir: root,
  transform: {
    '^.+\\.(ts|js|html)$': ['jest-preset-angular', {
      tsconfig: '/private/tmp/clark-profile-tsconfig.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }]
  },
  moduleNameMapper: {...config.moduleNameMapper, '^app/(.*)$': root + '/src/app/$1'}
};
```


### Merge conflict resolution (2026-10-26)

Compared index stages 2 and 3 for all seven unmerged files before resolving. Playlist files differ only in the existing feature's userId query support/public-only service method and regression test; keep those. The incoming profile-learning-objects code restores collection grouping, superseded by the requested flat presentation; keep the flat component/template and state inputs. Both metrics versions use learningObjectcuid; keep encoding from this branch. Preserve all unrelated incoming staged work (including rating, library and builder changes). Resolve and stage only the seven conflict paths plus this plan, then run profile/playlist/metrics tests and the Angular build. Do not commit or finish the merge automatically.

- Decision: Retain stage 2 content for the seven conflicted files after comparing both versions.
  Rationale: Stage 3 contains no additional feature behavior to combine in these files; it lacks the public profile additions and restores the superseded collection grouping. Metrics encoding preserves the incoming parameter fix as well as the existing regression coverage.
  Date/Author: 2026-10-26 / Codex

Merge validation: all 22 focused profile/playlist/metrics tests passed using the documented temporary Jest config. `npx ng build clark` passed with the existing querystring CommonJS warning. No source files beyond the seven conflicts were modified by this resolution. The merge remains uncommitted for user review.
