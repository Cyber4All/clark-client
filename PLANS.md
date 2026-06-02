# Execution Plans for `clark-client`

This document defines how to write and maintain an execution plan ("ExecPlan") for work in this repository. An ExecPlan is a living implementation specification that an agent or engineer can follow from research through validation.

Every ExecPlan in this repository must be written and maintained in accordance with this file.

## Purpose

`clark-client` is a single Angular 18 SPA for CLARK. It is NgModule-oriented, lazy-loads major feature areas, uses domain services and custom RxJS-based state patterns, and contains a mix of legacy and newer frontend approaches. ExecPlans exist to make multi-step work understandable, safe, and restartable in a codebase with architectural drift. :contentReference[oaicite:9]{index=9}

An ExecPlan must let a contributor understand:

- what user or system behavior is changing
- which feature areas and architectural layers are affected
- what the safest implementation order is
- how success will be validated
- how to recover if work stops halfway through

## When an ExecPlan is required

Create an ExecPlan when work includes any of the following:

- a Shortcut story spanning multiple feature areas
- a change across routes, guards, services, and components
- a meaningful auth/access change
- a cross-cutting UI/shared-component change
- a type/model cleanup affecting multiple files or layers
- service/API-layer modernization
- a state-management or store refactor
- a form-pattern migration
- a build, environment, CircleCI, or deployment change
- a large cleanup/refactor in a legacy area
- any work likely to take more than one implementation session

Small, narrow changes may skip an ExecPlan, but when in doubt, create one.

## Where ExecPlans live

Create story-specific ExecPlans under `plans/`.

Naming convention:

- `plans/sc-<story-id>-<short-kebab-description>.execplan.md`
- `plans/<short-kebab-description>.execplan.md` if no story ID is available

Examples:

- `plans/sc-2401-modernize-organization-service-types.execplan.md`
- `plans/sc-2510-fix-auth-guard-redirect-loop.execplan.md`
- `plans/reduce-builder-component-api-coupling.execplan.md`

## Core planning principle for this repo

This repo is a "today plus target state" codebase.

That means every ExecPlan must do two things:

1. describe current reality honestly
2. define the smallest safe move toward a cleaner target state

Plans must not assume the repo already follows a fully clean Angular architecture. They must explicitly name where the current code is legacy, mixed, inconsistent, or fragile.

## Required characteristics

Every ExecPlan must be:

- self-contained
- understandable by a newcomer
- explicit about repository paths and affected files
- honest about legacy constraints
- clear about what will and will not be refactored
- specific about validation
- maintained as implementation proceeds

An ExecPlan is not just a design idea. It must describe the actual intended implementation path and the concrete proof that the change works.

## Repository orientation for plan authors

When writing a plan, assume the reader does not know this repo.

Describe the relevant repository layout directly in the plan. Common areas include:

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
- `src/environments`
- `.circleci`

Also explain the current request/data flow or interaction flow:

- route
- guard
- component
- service/store
- API call
- model/type
- UI update

If the work touches shared UI or core services, explain likely downstream impact.

## Architectural expectations plans must reflect

Plans must reflect the repo’s current and target architecture.

### Current reality

- NgModule-based Angular app
- lazy-loaded feature areas
- service-driven domain logic
- custom RxJS store/state patterns
- mixed form approaches
- mixed legacy and newer API typing patterns
- testing/build tooling drift

### Target direction for touched code

- thinner components
- stronger service boundaries
- fewer direct HTTP calls in components
- better type clarity
- safer subscription management
- more consistent form choices
- more explicit shared-vs-feature ownership
- incremental modernization without unnecessary churn

Plans should make that transition explicit where relevant.

## What plans must call out explicitly

For any meaningful change, the plan must state:

- whether the work is local or cross-cutting
- whether it touches routing
- whether it touches guards/interceptors
- whether it touches shared UI
- whether it changes service/API boundaries
- whether it changes state ownership
- whether it changes types/entities/interfaces
- whether it changes environment or build behavior
- which tests or validation methods will prove success
- what technical debt is intentionally left in place

## Testing expectations for plans

Every ExecPlan must include a validation section matched to the kind of work.

### UI or interaction changes

Include:

- the component(s) or route(s) affected
- the expected visible behavior
- the tests to update or add if the area has useful coverage
- manual validation steps when automated coverage is weak

### Service or API-layer changes

Include:

- the affected service files
- the expected request/response behavior
- type changes
- tests to update or add
- any risk from legacy callers

### Shared UI changes

Include:

- likely downstream consumers
- any behavior contracts that may break
- visual/manual verification steps
- Storybook or equivalent checks if relevant

### Routing, guard, or auth changes

Include:

- route paths affected
- access behavior before and after
- redirect expectations
- manual and automated validation steps

### Build or environment changes

Include:

- exact files edited
- environment replacement expectations
- generated-file behavior
- local and CI validation expectations

## Required sections in every ExecPlan

Every ExecPlan must contain these sections and keep them current:

- `# <Title>`
- `## Purpose / Big Picture`
- `## Progress`
- `## Surprises & Discoveries`
- `## Decision Log`
- `## Outcomes & Retrospective`
- `## Context and Orientation`
- `## Plan of Work`
- `## Concrete Steps`
- `## Validation and Acceptance`
- `## Idempotence and Recovery`
- `## Artifacts and Notes`
- `## Interfaces and Dependencies`

## Progress requirements

The `Progress` section must use checkboxes and timestamps.

Example:

- [x] (2026-03-27 18:10Z) Reviewed `src/app/core/organization-module/organization.service.ts` and its callers.
- [x] (2026-03-27 18:35Z) Identified direct component-level HTTP usage in `change-author.component.ts`.
- [ ] Replace direct component HTTP call with domain service usage.
- [ ] Update tests and validate the affected route flow.

Every time work pauses, the plan must state what is complete and what remains.

## Decision log requirements

Each meaningful decision must use this format:

- Decision: Keep the existing route/module structure and avoid standalone migration in this story.
  Rationale: The story only changes guard behavior and a routing modernization would expand scope without reducing delivery risk.
  Date/Author: 2026-03-27 / Codex

## Planning rules for messy legacy areas

This repo has areas with architectural drift. Plans for those areas must explicitly choose one of these strategies:

- stabilize in place
- extract logic without changing UX
- modernize touched files only
- perform a staged refactor with temporary compatibility
- defer broader cleanup and document it

Plans must not quietly expand into “while we are here” rewrites.

## Preferred modernization moves

When appropriate, ExecPlans may move touched code toward these target standards:

- move direct HTTP logic out of components and into services
- strengthen request/response typing
- consolidate duplicated types
- reduce `any` usage
- prefer clearer RxJS ownership boundaries
- move complex form logic toward reactive forms
- reduce shared-component contract ambiguity
- document and contain environment/build fragility

A plan must still justify why each modernization move belongs in scope.

## Commands and validation style

Concrete steps must include exact commands and working directories when possible.

Examples may include:

- dependency install
- local serve/build commands
- targeted test commands
- lint/type-check commands
- manual UI verification flows

If test tooling drift prevents a single reliable command, say so directly and specify the nearest trustworthy validation path.

## Change management requirements

ExecPlans are living documents. When implementation changes direction:

- update `Plan of Work`
- update `Progress`
- add a `Decision Log` entry
- update `Validation and Acceptance`
- note any newly discovered repo fragility

Do not leave stale instructions in the plan.

## How plans should relate to Shortcut stories

When the work comes from Shortcut:

- include the story ID and title in the plan title or intro
- restate the user-visible behavior
- translate the story into Angular/client implementation terms
- identify likely affected routes, components, services, state, shared UI, and tests
- identify missing product or UX details
- call out backend/API dependencies when relevant
- call out cross-epic or cross-team dependencies when relevant

## ExecPlan skeleton for this repository

Use this skeleton when creating a new plan.

```md
# <Shortcut ID or feature name>: <Short action-oriented title>

This ExecPlan is a living document and must be maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

Explain what user-visible or system-visible behavior will exist after this change. State how someone can observe success in `clark-client`.

## Progress

- [ ] Example step with timestamp once started.

## Surprises & Discoveries

- Observation: None yet.
  Evidence: N/A.

## Decision Log

- Decision: Initial placeholder.
  Rationale: Initial placeholder.
  Date/Author: YYYY-MM-DD / <author>

## Outcomes & Retrospective

Summarize what was completed, what remains, and what was learned.

## Context and Orientation

Describe the affected routes, components, services, guards, shared modules, interfaces/types/entities, environment files, and tests by full repository-relative path. Explain the current interaction flow and where the change fits.

## Plan of Work

Describe the implementation strategy in prose. Be explicit about what is in scope and out of scope.

## Concrete Steps

From the repository root, run:

    <command>

Expect:

    <short expected result>

## Validation and Acceptance

Describe automated and manual validation. Include route flows, UI behavior, service/API expectations, auth/access expectations, and any build/deploy checks if relevant.

## Idempotence and Recovery

Explain which steps are safe to repeat and how to recover from half-complete changes, partial refactors, or failing local setup.

## Artifacts and Notes

Include concise snippets, screenshots, command output summaries, or callouts relevant to proof and handoff.

## Interfaces and Dependencies

Name the components, services, guards, interceptors, types, entities, environment files, and external dependencies affected by this work.
```
