# AGENTS.md

This repository is `clark-client`, the Angular frontend for CLARK.

It is a single Angular 18 client-side SPA built with Angular CLI/application builder. It is not Nx, not Angular Universal/SSR, and is still primarily NgModule-based rather than standalone-first.

Coding agents working in this repository must follow the conventions in this file and, when required, create and maintain an ExecPlan using `PLANS.md` in the repository root.

For any story-scale or multi-step work that requires an ExecPlan, implementation must not begin until the story-specific ExecPlan file exists under `plans/`.

## Purpose of this file

This repository has legacy and modern patterns mixed together. The goal of this file is not to pretend the codebase is already fully standardized. The goal is to help agents:

- understand the current structure
- preserve working patterns where needed
- avoid making the architecture more inconsistent
- move touched code toward a cleaner target state
- plan changes safely across routing, services, UI, state, and environments

## Today vs target standard

This repo contains multiple generations of frontend patterns. Agents must treat the current codebase as a blend of legacy and newer approaches.

When editing existing code:

- follow local conventions closely enough to avoid unnecessary churn
- do not do drive-by rewrites
- improve touched code incrementally where it materially reduces risk

When introducing new code:

- prefer the target standards defined in this file
- do not add new legacy patterns when a cleaner established alternative exists

## When to use an ExecPlan

Use an ExecPlan for any work that is not obviously small and local.

In this repository, an ExecPlan is required when work includes any of the following:

- a Shortcut story that spans multiple feature areas
- a change across routing, guards, services, and UI together
- a cross-cutting refactor
- API contract changes that affect multiple services or views
- data-model or type refactors affecting multiple modules
- auth, access, interceptor, or environment/config changes
- a major Angular upgrade or architectural migration step
- a significant state-management change
- a substantial form rewrite
- a build, CI, deploy, or environment change
- work likely to require more than one focused implementation session

An ExecPlan is usually not required for:

- a small template fix
- a narrow style fix
- a contained bug fix in one component or service
- a small unit-test-only change

When in doubt, create an ExecPlan.

### Default behavior for agents

For Shortcut stories, multi-file work, or any task likely to involve more than a narrow local edit, agents must treat ExecPlan creation as the default first implementation step.

That means:

- read `PLANS.md` before making code changes
- create the story-specific ExecPlan file in `plans/`
- record initial progress and current understanding in that file
- only then begin implementation

Tool-level or conversational planning alone is not sufficient when `PLANS.md` requires an ExecPlan file. The repo plan file is the source of truth and must be kept current as work proceeds.

## Where plans live

Repository-wide planning guidance lives in `PLANS.md`.

Story-specific execution plans should be created under `plans/` with descriptive names, for example:

- `plans/sc-1234-fix-auth-redirect.execplan.md`
- `plans/sc-1822-refactor-organization-service-types.execplan.md`
- `plans/modernize-builder-store-pattern.execplan.md`

If the work comes from Shortcut, include the story ID when available.

## Repository orientation

This repository is not organized around a clean `modules/` or `features/` convention. Major application areas currently live in top-level folders such as:

- `src/app/auth`
- `src/app/admin`
- `src/app/collection`
- `src/app/cube`
- `src/app/onion`
- `src/app/core`
- `src/app/shared`
- `src/app/components`
- `src/app/interfaces`
- `src/entity`

### What these areas generally mean

- `src/app/core/`: domain services, guards, interceptor, some module-oriented logic
- `src/app/shared/`: shared components, directives, pipes, validators, shared modules
- `src/app/components/`: reusable app-level components and shell-ish UI
- feature folders like `auth`, `admin`, `cube`, `collection`, `onion`: routeable product areas
- `src/app/interfaces/`: app-level interfaces
- `src/entity/`: domain entities/classes
- `src/environments/`: build-time environment files
- `.circleci/`: CI/CD configuration

Agents must inspect nearby code before adding new files because naming and boundaries are not fully consistent across the repo.

## Routing conventions

This is a lazy-loaded Angular application with route-based guards.

Examples of routing are currently rooted in files like:

- `src/app/clark.routing.ts`
- feature routing files under feature folders

Current pattern:

- NgModule-based routing is the default
- route guards are common
- standalone-first patterns are not the repo standard today

When modifying routing:

- preserve lazy-loading where it already exists
- keep route protection explicit
- verify auth/access implications
- do not introduce a parallel routing style without a strong reason

## Component, service, and state boundaries

This repo is component-heavy and service-driven. There is no single formal state framework like NgRx or Akita. State is often handled through custom RxJS services using `BehaviorSubject` or `Subject`. :contentReference[oaicite:1]{index=1}

### Target boundary rules

For new work and touched code, prefer these boundaries:

- components should focus on presentation, user interaction, and view orchestration
- services should own API access, domain operations, and reusable business/UI state logic
- guards should own access decisions tied to routing
- interceptors should own cross-cutting HTTP concerns
- resolvers should be used only when route-level prefetch materially improves UX or simplifies the flow

Avoid:

- direct `HttpClient` calls inside components
- large components that combine rendering, API access, and state orchestration
- duplicating API request logic across multiple components
- hiding business rules in templates

If a legacy area already violates these rules, improve only the touched area unless the task explicitly includes a broader refactor.

## API access conventions

API access is mostly hand-written via domain services under `src/app/core/*`, often using route helper files such as `*.routes.ts`. Types are hand-written and may exist as:

- entities in `src/entity`
- interfaces in `src/app/interfaces`
- feature-local types in feature folders :contentReference[oaicite:2]{index=2}

### Target standards for new and touched code

Prefer:

- one domain-oriented service per API/domain area
- typed request and response methods
- explicit return types
- centralized route/URL construction within the service layer or route helper files
- runtime validation for risky API boundaries when a local pattern already exists
- consistency with newer typed service patterns where practical

Avoid introducing:

- `any` when a real type is available
- new `toPromise()` usage
- direct component-level HTTP calls
- ad hoc endpoint strings scattered across components

When modernizing touched services:

- prefer `Observable`-based patterns aligned with Angular `HttpClient`
- strengthen typing before broad logic changes
- keep migration scope bounded unless the task explicitly calls for service modernization

## Type and model conventions

This repository uses a mixed model/type strategy today. Concepts may appear in:

- `src/entity`
- `src/app/interfaces`
- feature-local `*.types.ts`
- service-local ad hoc typing :contentReference[oaicite:3]{index=3}

Agents must avoid making this worse.

### Rules

When adding or changing types:

- first look for an existing type or entity that already represents the concept
- avoid duplicating the same shape in multiple locations
- put feature-local types close to the feature when they are not broadly shared
- use shared interfaces/types only when multiple areas truly consume them
- do not create both an interface and class for the same concept unless there is a real need

When a story involves type cleanup:

- document which type becomes the source of truth
- update callers consistently
- avoid partial migrations that leave ambiguous duplicates unless the plan explicitly stages the migration

## Forms conventions

This repo currently uses both reactive forms and template-driven forms. It is not realistic to enforce an immediate repo-wide rewrite. :contentReference[oaicite:4]{index=4}

### Target standard

For new work:

- prefer reactive forms for complex forms, dynamic validation, and multi-step workflows
- use template-driven forms only for simple/local interactions where that is already the surrounding pattern

For existing work:

- do not rewrite a stable template-driven form to reactive unless the task benefits from it
- if a form is already complex or fragile, prefer moving it toward reactive patterns when touched

## Subscription and RxJS hygiene

Subscription hygiene is a known risk area in this repo. Manual RxJS lifecycle handling exists in many places. :contentReference[oaicite:5]{index=5}

When editing components or services:

- prefer patterns that make subscription lifetime clear
- clean up subscriptions consistently
- avoid nested subscriptions when a flattening operator is clearer
- avoid creating additional stateful streams in components when a service/store is the better owner
- preserve readable stream flow over clever operator chains

Do not introduce new memory-leak risk just to match a legacy local pattern.

## Shared UI and styling conventions

Angular Material and custom SCSS are in use. Shared UI exists, but not as a strongly enforced formal design system. Storybook also appears to exist in some form. :contentReference[oaicite:6]{index=6}

When building UI:

- reuse existing shared components/modules when appropriate
- prefer consistency with nearby UX patterns over inventing new visual conventions
- keep feature-specific styling local where possible
- avoid spreading one-off style overrides across many files

If a shared component is modified:

- check likely downstream usage before changing public inputs, outputs, or styling assumptions

## Naming and file conventions

This repo has naming drift. Agents should make new code more consistent rather than preserving avoidable inconsistency.

### Preferred naming for new files

Use Angular and local conventions consistently within the touched area, for example:

- `*.component.ts`
- `*.service.ts`
- `*.module.ts`
- `*.routing.ts` if staying consistent with current feature routing style
- `*.guard.ts` or the local guard naming pattern
- `*.resolver.ts`
- `*.directive.ts`
- `*.pipe.ts`
- `*.types.ts`

If a local area clearly uses a different pattern already, stay consistent inside that area unless the task includes cleanup.

Do not rename files just for cosmetic consistency unless the task includes refactoring and the imports/usages can be updated safely.

## Testing expectations

Testing exists in this repo, but there is drift between documented and configured test tooling. Jest config exists, many `*.spec.ts` files exist, but `angular.json` still references Karma-style configuration in places. CircleCI and local testing expectations are not perfectly aligned today. :contentReference[oaicite:7]{index=7}

### Required behavior for agents

Before changing tests:

- inspect `package.json`
- inspect `angular.json`
- inspect the nearest existing spec patterns
- prefer the test runner and style actually used by the touched area

When changing code:

- update or add tests when the surrounding area has test coverage
- preserve existing passing tests
- do not claim broad test confidence if only a narrow subset was run

### Target standard

For new or modernized tests:

- prefer the test path actually supported by the repo today
- write focused unit tests for services, guards, utilities, and isolated components where practical
- add integration-ish component tests when UI behavior is complex
- document any tooling drift discovered if it affects confidence

## Build, environment, and release conventions

This repo uses environment files under `src/environments` and CircleCI for build/deploy to S3 + CloudFront across dev, experimental, staging, and prod. The repo also has fragile build details such as generated `src/commit-hash.ts`, a referenced-but-missing `src/env.js`, and some CI-specific build workarounds. :contentReference[oaicite:8]{index=8}

When changing build or environment behavior:

- inspect `angular.json`
- inspect relevant scripts in `package.json`
- inspect `.circleci/config.yml`
- preserve environment file replacement behavior unless the task explicitly changes it
- account for prebuild-generated files
- call out fragility clearly in the plan or summary

Do not introduce new environment/config access patterns casually. Keep environment handling explicit and traceable.

## Review guidelines

When reviewing or preparing changes, verify:

- route changes preserve auth/access expectations
- components are not taking on new direct API responsibilities
- service changes do not reduce typing quality
- touched code becomes more consistent, not less
- new state logic has clear ownership
- forms follow the least-surprising pattern for the area
- tests were updated where needed
- environment/build changes account for CI behavior
- risky shared-component changes are evaluated for downstream impact

## Implementation guidance for agents

Before editing code:

1. Identify the feature area and nearby conventions.
2. Determine whether the work is local, cross-feature, or cross-cutting.
3. Decide whether an ExecPlan is required.
4. Inspect sibling components/services/guards/tests first.
5. Prefer small, safe steps over wide rewrites.
6. Move touched code toward target standards without expanding scope unnecessarily.

When handling messy legacy areas:

- stabilize first
- refactor second
- do not combine unrelated cleanup with feature delivery unless the plan explicitly includes it

## Output expectations for agents

At the end of the task, provide:

- a concise summary of what changed
- the key files changed
- tests run and what they proved
- any areas of repo drift discovered
- any follow-up work recommended
