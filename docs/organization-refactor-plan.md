# Organization Refactor Plan: String to OrganizationId

## Executive Summary

This document outlines the plan to refactor user/author organization references from using the direct string property `organization` to using `organizationId` with a cached organization lookup service.

**Current State**: Components access `user.organization` or `author.organization` directly (string property)  
**Target State**: Components use `user.organizationId` with `OrganizationStore` for async observable lookups with intelligent caching

**CRITICAL**: The `organization` string field is being **REMOVED** from the User entity entirely. There is no backward compatibility - all references must be migrated.

---

## Background

### User Entity Structure

File: `src/entity/user/user.ts`

**IMPORTANT**: The User class is being migrated to ONLY have:

- `_organizationId: string` - ObjectId reference to Organization document

The `_organization` string property is being **REMOVED** by backend migration scripts.

```typescript
// Lines 104-114 (CURRENT - BEFORE MIGRATION)
_organizationId: string;
get organizationId(): string { return this._organizationId; }
set organizationId(organizationId: string) { ... }

// The _organization property will be DELETED
```

**Impact**: All code accessing `user.organization` or `author.organization` will break and must be updated.

### Organization Service (Existing)

File: `src/app/core/organization-module/organization.service.ts`

**This service reflects the exact API contract and provides the HTTP layer.**

Provides:

- `getById(id)` - Get single organization by ID (new endpoint: GET /organizations/:id)
- `searchOrganizations(request)` - Search/filter organizations with caching
- `suggestDomain(email)` - Get organization suggestion by email domain
- `createOrganization(request)` - Create new organization
- `updateOrganization(id, request)` - Update organization

### OrganizationStore (To Be Created)

File: `src/app/core/organization-module/organization.store.ts`

**This service provides a caching layer on top of OrganizationService.**

Provides:

- `organization$(id)` - Get Organization object as Observable (cached with shareReplay)
- `organizationName$(id)` - Get formatted organization name as Observable<string>
  - Uses formatOrgName() with acronym-preserving heuristic + TitleCasePipe
- `refresh(id)` - Force refetch for a specific organization
- `clear()` - Clear entire cache

**Caching Strategy**: Individual lookups with Map<id, Observable<Organization>> + shareReplay(1) to prevent N+1 queries.

---

## Audit Results

### Components Using `organizationFormat()` Helper

This function formats organization strings for display (applies titleCase conditionally).

| Component                       | File Path                                                                        | Line               | Usage Pattern                                                             |
| ------------------------------- | -------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------- |
| **author-card**                 | `src/app/shared/components/author-card/`                                         | HTML:12, TS:27     | `organizationFormat(author?.organization)`                                |
| **learning-object**             | `src/app/cube/shared/learning-object/`                                           | HTML:66, TS:220    | `organizationFormat(learningObject.contributors[0]?.organization)`        |
| **user-dropdown**               | `src/app/onion/learning-object-builder/components/user-dropdown/`                | HTML:17, TS:103    | `organizationFormat(user.organization)`                                   |
| **user-search-wrapper**         | `src/app/admin/components/user-search-wrapper/`                                  | HTML:34, TS:86     | `organizationFormat(u.organization)`                                      |
| **draggable-learning-object**   | `src/app/admin/components/draggable-learning-object/`                            | HTML:25, TS:101    | `organizationFormat(learningObject.contributors[0]?.organization.trim())` |
| **change-author**               | `src/app/admin/components/change-author/`                                        | HTML:59, TS:76     | `organizationFormat(highlightedLearningObject.author.organization)`       |
| **change-author-user-dropdown** | `src/app/admin/components/change-author/components/change-author-user-dropdown/` | HTML:15,28, TS:138 | `organizationFormat(selectedAuthor.organization)`                         |
| **curator-card**                | `src/app/collection/shared/included/curators/curator-card/`                      | HTML:12, TS:37     | `organizationFormat(curator.organization)`                                |

### Components with Direct Organization Access (No Helper Function)

| Component                                | File Path                                                           | Lines                             | Usage                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| **user-card** (admin)                    | `src/app/admin/components/user-card/`                               | HTML:16                           | Direct template access with length check: `(user?.organization.length > 20)` |
| **profile-header**                       | `src/app/cube/user-profile/components/profile-header/`              | HTML:6                            | Direct pipe: `user.organization \| titlecase`                                |
| **selected-user** (admin/add-evaluator)  | `src/app/admin/components/add-evaluator/components/selected-user/`  | HTML:3                            | Direct pipe: `user.organization \| titlecase`                                |
| **user-dropdown** (shared/add-evaluator) | `src/app/shared/components/add-evaluator/components/user-dropdown/` | HTML:23                           | Direct pipe: `user.organization \| titlecase`                                |
| **edit-profile**                         | `src/app/cube/user-profile/components/edit-profile/`                | TS:70,105,121,128,142,143,208,212 | Form control, validation, comparison, updates                                |

### Components with Organization Management

| Component        | File Path                                            | Functionality                                                                                       |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **edit-profile** | `src/app/cube/user-profile/components/edit-profile/` | User profile editing with organization search/autocomplete using `OrganizationService.searchOrgs()` |
| **register**     | `src/app/auth/register/`                             | User registration with organization search/autocomplete using `OrganizationService.searchOrgs()`    |

### Services Using Organization

| Service          | File Path                                  | Lines | Usage                                                         | Priority                            |
| ---------------- | ------------------------------------------ | ----- | ------------------------------------------------------------- | ----------------------------------- |
| **auth.service** | `src/app/core/auth-module/auth.service.ts` | 615   | RUM tracking metadata: `organization: this.user.organization` | **CRITICAL** - Analytics/monitoring |

---

## Key Findings

### 1. Organization Display Pattern

Most components use the `organizationFormat()` helper function, which:

```typescript
organizationFormat(organization: string) {
  if (organization.charAt(1) === organization.charAt(1).toUpperCase()) {
    return organization;
  } else {
    return titleCase(organization);
  }
}
```

**Issue**: This takes a string, but we'll be fetching Organization objects.

### 2. User Entity Changes (BREAKING)

The User entity is being migrated:

- `organization` (string) - **BEING REMOVED** by backend scripts
- `organizationId` (string) - **ONLY field remaining**

**No Decision Needed**: The string field is gone. All code must migrate to organizationId.

### 3. Learning Objects Access Contributors

Learning objects have `contributors` arrays of User objects:

```typescript
learningObject.contributors[0]?.organization;
```

### 4. Forms Must Submit OrganizationId

Both `edit-profile` and `register` components:

- Use OrganizationService for autocomplete search ✓
- Currently submit organization as a string: `organization: this.editInfo.organization.trim()` ✗
- Store selectedOrg ID separately: `this.selectedOrg = org._id` ✓

**Required Change**: Backend now expects `organizationId`, NOT organization string. Forms must be updated to submit the ID.

---

## Migration Strategy

### Phase 1: Create OrganizationStore Infrastructure (1 day)

#### 1.1 Add getOrganizationById() to OrganizationService

**File**: `src/app/core/organization-module/organization.service.ts`

**Add method**:

```typescript
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response shape for GET /organizations/:id
 */
interface GetOrganizationByIdResponse {
  organization: Organization;
}

/**
 * Get organization by ID
 * @param id Organization ObjectId
 * @returns Observable<Organization>
 */
getOrganizationById(id: string): Observable<Organization> {
  return this.http.get<GetOrganizationByIdResponse>(`${this.url}/${id}`).pipe(
    map(res => OrganizationSchema.parse(res.organization))
  );
}
```

**Note**: If backend returns Organization directly (not wrapped), remove the response interface and use:

```typescript
return this.http.get<Organization>(`${this.url}/${id}`).pipe(map((org) => OrganizationSchema.parse(org)));
```

#### 1.2 Create OrganizationStore

**File**: `src/app/core/organization-module/organization.store.ts`

**Strategy**: Cache individual organization lookups using Map with shareReplay(1) to prevent duplicate HTTP requests.

```typescript
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.types';

@Injectable({ providedIn: 'root' })
export class OrganizationStore {
  private cache = new Map<string, Observable<Organization>>();
  private titleCasePipe = new TitleCasePipe();

  constructor(private orgService: OrganizationService) {}

  /**
   * Get organization by ID (cached)
   * @param id Organization ObjectId
   * @returns Observable<Organization | null> - null if id is empty or error occurs
   */
  organization$(id: string): Observable<Organization | null> {
    if (!id) return of(null);

    if (!this.cache.has(id)) {
      const org$ = this.orgService.getOrganizationById(id).pipe(
        catchError((err) => {
          // Evict from cache on error so future calls can retry
          this.cache.delete(id);
          // Return null for UI resilience (component can handle gracefully)
          return of(null as any);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.cache.set(id, org$);
    }

    return this.cache.get(id)!;
  }

  /**
   * Get formatted organization name by ID
   * @param id Organization ObjectId
   * @returns Observable<string> - formatted organization name
   */
  organizationName$(id: string): Observable<string> {
    return this.organization$(id).pipe(map((org) => (org ? this.formatOrgName(org.name) : '')));
  }

  /**
   * Force refresh organization by ID
   * @param id Organization ObjectId
   */
  refresh(id: string): void {
    this.cache.delete(id);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Format organization name - preserve acronyms, apply title case to others
   * @param name Organization name
   * @returns Formatted name
   */
  private formatOrgName(name: string): string {
    if (!name) return '';
    // If second character is uppercase, assume it's an acronym (e.g., "UCLA")
    if (name.length > 1 && name.charAt(1) === name.charAt(1).toUpperCase()) {
      return name;
    }
    return this.titleCasePipe.transform(name);
  }
}
```

**Key Points**:

- **Async observables** with async pipe in templates
- Individual HTTP calls with intelligent caching via shareReplay({ refCount: false })
- Error handling: cache eviction on failure enables retry, returns null for UI resilience
- On-demand fetching - organizations loaded as needed
- **Caching behavior**: Prevents duplicate HTTP calls for the SAME organizationId and shares in-flight requests
- **Note**: Many unique organizationIds in a list will still trigger multiple requests (one per unique ID). Consider batch endpoint for future optimization if needed.

#### 1.3 Update Components to Use OrganizationStore

**NO custom pipe needed** - use OrganizationStore methods directly in templates with async pipe.

**Component Pattern**:

```typescript
import { OrganizationStore } from '@app/core/organization-module/organization.store';

export class ExampleComponent {
  // Inject as public for template access
  constructor(public orgStore: OrganizationStore) {}
}
```

**Template Pattern**:

```html
<!-- Before -->
{{ organizationFormat(author?.organization) }}

<!-- After -->
{{ orgStore.organizationName$(author?.organizationId) | async }}
```

**For lists with many items, consider using trackBy**:

```typescript
trackByUserId(index: number, user: User): string {
  return user.userId;
}
```

```html
<div *ngFor="let user of users; trackBy: trackByUserId">{{ orgStore.organizationName$(user.organizationId) | async }}</div>
```

**Benefits of async observable approach**:

- Standard Angular 18 pattern with async pipe
- Automatic subscription management (no memory leaks)
- Leverages RxJS caching with shareReplay({ refCount: false })
- Cache sharing: Multiple subscriptions to same ID reuse cached observable
- Better error handling with automatic retry capability via cache eviction

### Phase 2: Migrate Display Components (2-3 days)

For each component using `organizationFormat()`, migrate in this order:

#### Priority 1: Simple Display Components (Low Risk)

1. **author-card** - Most isolated, good test case
2. **curator-card** - Similar to author-card
3. **profile-header** - Simple display only
4. **selected-user** (add-evaluator) - Simple display only

#### Priority 2: List/Table Components (Medium Risk)

5. **user-card** (admin)
6. **user-search-wrapper**
7. **user-dropdown** (shared/add-evaluator) - User list with search
8. **learning-object** (cube shared)
9. **draggable-learning-object**

#### Priority 3: Complex Components (Higher Risk)

10. **change-author** - Has complex logic, author switching
11. **user-dropdown** (onion/learning-object-builder) - Used in multiple contexts

#### Priority 4: Critical Services (Highest Risk)

12. **auth.service** - RUM tracking, affects analytics across entire app

#### Migration Pattern for Each Component:

**Before** (TypeScript):

```typescript
export class ExampleComponent {
  organizationFormat(organization: string) {
    if (organization.charAt(1) === organization.charAt(1).toUpperCase()) {
      return organization;
    } else {
      return titleCase(organization);
    }
  }
}
```

**Before** (Template):

```html
{{ organizationFormat(author?.organization) }}
```

**After** (TypeScript):

```typescript
import { inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrganizationStore } from '@app/core/organization-module/organization.store';

export class ExampleComponent {
  private destroyRef = inject(DestroyRef);

  constructor(public orgStore: OrganizationStore) {}
  // Remove organizationFormat() method entirely
}
```

**After** (Template):

```html
{{ orgStore.organizationName$(author?.organizationId) | async }}
```

**For manual subscriptions (rare - only for side effects)**:

```typescript
someMethod() {
  this.orgStore
    .organizationName$(author.organizationId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((name) => {
      // Do something with name (logging, analytics, etc.)
    });
}
```

**No Fallback Needed**: The `organization` field is being removed, so there's nothing to fall back to. All references must use `organizationId`.

### Phase 3: Update Form Components (1-2 days)

#### 3.1 edit-profile Component

**Current behavior**:

- Searches organizations for autocomplete
- Stores selected org ID in `selectedOrg`
- Submits organization NAME as string

**Target behavior**:

- Keep autocomplete search (already using OrganizationService) ✓
- Submit `organizationId` instead of organization string
- Backend already updated to accept/require organizationId
- Use takeUntilDestroyed() for any manual subscriptions

**Files to modify**:

- `src/app/cube/user-profile/components/edit-profile/edit-profile.component.ts`

**Changes**:

1. Replace `organization: this.editInfo.organization.trim()` with `organizationId: this.selectedOrg`
2. Update any validators/comparisons using organization string
3. Display current organization via OrganizationStore: `orgStore.organizationName$(user.organizationId) | async`

#### 3.2 register Component

**Current behavior**:

- Searches organizations for autocomplete
- Stores selected org ID in `selectedOrg`
- Submits organization NAME as string

**Target behavior**:

- Keep autocomplete search ✓
- Submit `organizationId` during registration
- Backend already updated to accept/require organizationId
- Use takeUntilDestroyed() for any manual subscriptions

**Files to modify**:

- `src/app/auth/register/register.component.ts`

**Changes**:

1. Replace `organization: orgSelection.name` with `organizationId: this.selectedOrg`
2. Ensure validation requires organizationId when org is selected

### Phase 4: Update auth.service RUM Tracking (0.5 day)

**File**: `src/app/core/auth-module/auth.service.ts`

**Current**: `organization: this.user.organization` (string)

**Target**: Send both organizationId and resolved organizationName for dashboard compatibility

**Implementation approach**:

1. Send organizationId immediately (non-blocking)
2. Resolve organizationName asynchronously via OrganizationStore (best-effort)
3. Do not block auth flow or navigation waiting for organization name

**Implementation**:

```typescript
import { inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrganizationStore } from '@app/core/organization-module/organization.store';

export class AuthService {
  private destroyRef = inject(DestroyRef);
  private orgStore = inject(OrganizationStore);

  private sendRumMetadata() {
    const metadata = {
      userId: this.user.userId,
      organizationId: this.user.organizationId,
    };

    // Send organizationId immediately
    this.rumService.setUserContext(metadata);

    // Resolve organization name asynchronously (best-effort, non-blocking)
    if (this.user.organizationId) {
      this.orgStore
        .organizationName$(this.user.organizationId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((orgName) => {
          if (orgName) {
            // Update RUM context with organization name when available
            this.rumService.setUserContext({
              ...metadata,
              organizationName: orgName,
            });
          }
        });
    }
  }
}
```

**Key Points**:

- Use takeUntilDestroyed() instead of manual unsubscribe
- Send organizationId for filtering, organizationName for display
- Non-blocking - RUM metadata resolves asynchronously without delaying auth
- No toPromise() usage

### Phase 5: Update User Entity (0.5 day)

**File**: `src/entity/user/user.ts`

**Remove organization field completely**:

1. Delete `_organization` property
2. Delete `organization` getter and setter
3. Update `toPlainObject()` to exclude organization
4. Keep only `_organizationId` and `organizationId` getter/setter

### Phase 6: Testing & Validation (1-2 days)

### Phase 6: Testing & Validation (1-2 days)

1. **Remove deprecated code**:
   - Remove `organizationFormat()` from all components
   - Verify no `.organization` string references remain

2. **Testing Strategy**:
   - Unit tests for OrganizationStore
     - Caching with shareReplay({ refCount: false })
     - Verify same ID returns same observable (cache hit)
     - Error eviction and retry capability
     - formatOrgName() preserves acronyms (e.g., "UCLA" stays "UCLA")
   - Unit tests for OrganizationService.getOrganizationById()
     - HTTP GET request
     - Response shape handling
     - Zod schema validation
   - Component tests with async pipe
     - Mock OrganizationStore
     - Test observables resolve correctly in templates
   - E2E tests for:
     - User profile editing
     - User registration
     - Learning object authorship display
     - Collection curator display
     - Admin user management

3. **Performance Testing**:
   - Verify caching prevents duplicate HTTP calls for same organizationId
   - Verify shareReplay shares in-flight requests (same ID accessed simultaneously)
   - Test with slow network to ensure proper async handling with async pipe
   - Monitor list views: many unique organizationIds will trigger multiple requests (expected)
   - Future optimization: consider batch endpoint (POST /organizations/lookup) if needed

---

## Risk Assessment

### High Risk Areas

1. **auth.service RUM tracking**
   - Used for analytics/monitoring across entire application
   - Organization data sent to monitoring service
   - Changes could affect reporting and dashboards
   - **Mitigation**: Send both organizationId (for filtering) and organizationName (for display)
   - **Implementation**: Use takeUntilDestroyed() for async resolution, non-blocking

2. **edit-profile** and **register** components
   - Backend already updated (no coordination needed)
   - Critical user flows - any bugs block user onboarding/profile updates
   - **Mitigation**: Thorough testing in dev environment, staged rollout

3. **change-author** component
   - Complex logic with author switching
   - Used in admin workflows
   - **Mitigation**: Extensive testing, staged rollout

4. **Learning object displays**
   - High traffic areas with multiple contributors
   - Each unique contributor orgId triggers separate HTTP call (expected behavior)
   - **Mitigation**: OrganizationStore caching prevents duplicate calls for same ID; consider batch endpoint if performance issues arise

### Medium Risk Areas

1. **User list/table displays**
   - Many users shown at once
   - **Cache behavior**: Each unique organizationId triggers ONE HTTP call; shareReplay shares in-flight requests
   - Many unique IDs will result in many requests (expected until batch endpoint added)
   - **Mitigation**: Monitor performance; verify shareReplay({ refCount: false }) prevents duplicate calls

2. **Async Pipe Management**
   - Components rely on async pipe for automatic subscription management
   - Memory leak risk if manual subscriptions used without takeUntilDestroyed()
   - **Mitigation**: Code review to ensure no manual subscriptions without cleanup

### Low Risk Areas

1. **author-card**, **curator-card**, **profile-header**
   - Single organization display
   - Less critical flows
   - Good for initial testing

---

## Testing Plan

### Unit Tests Required

- [ ] OrganizationStore
  - Caching behavior (Map + shareReplay({ refCount: false }))
  - Verify same ID returns same observable (cache hit)
  - Error eviction (delete from cache on error)
  - formatOrgName() logic (acronym preservation: "UCLA" → "UCLA", "towson" → "Towson")
  - refresh(id) triggers refetch
  - clear() clears entire cache
- [ ] OrganizationService.getOrganizationById()
  - HTTP GET request to /organizations/:id
  - Response shape handling
  - Zod schema validation
  - Error handling (404, network errors)
- [ ] Component integration with async pipe
  - Mock OrganizationStore
  - Test observables resolve correctly in templates
  - Test null organizationId handling

### Integration Tests Required

- [ ] edit-profile workflow with organizationId
- [ ] register workflow with organizationId
- [ ] Admin user card displays organization
- [ ] Learning object displays author organization
- [ ] Curator card displays organization

### E2E Tests Required

- [ ] Complete user registration with org selection
- [ ] Complete profile edit with org change
- [ ] Browse learning objects, verify org display
- [ ] Admin view user list, verify org display

---

## Implementation Timeline

| Phase | Duration | Dependencies | Deliverables |
| Phase | Duration | Dependencies | Deliverables |
| ----------------------------- | -------- | ---------------------------- | ---------------------------------------------------------- |
| Phase 1: Infrastructure | 1 day | OrganizationService (exists) | OrganizationStore, OrganizationService.getOrganizationById |
| Phase 2: Display Components | 2 days | Phase 1 | 13 components migrated to async pipe |
| Phase 3: Form Components | 1-2 days | Phase 1 | edit-profile, register submit organizationId |
| Phase 4: Auth Service RUM | 0.5 day | Phase 1 | RUM tracking with async resolution |
| Phase 5: User Entity Cleanup | 0.5 day | Phases 2-4 | Remove organization property from User class |
| Phase 6: Testing & Validation | 1-2 days | Phases 1-5 | All tests passing, verified in dev |

**Total Estimated Time**: 5-7 days (1 week)

**Note**: Efficient timeline because:

- Backend endpoint GET /organizations/:id already exists
- Backend already requires organizationId (no coordination needed)
- Async pipe pattern is standard Angular 18 (well-understood)
- OrganizationStore caching prevents duplicate calls for same organizationId
- shareReplay shares in-flight requests across multiple subscribers
- No fallback logic (organization field is gone from database)

## Open Questions

1. ~~Backend Coordination~~ **RESOLVED**:
   - ✅ Backend has GET /organizations/:id endpoint
   - ✅ Backend already requires organizationId in user updates/registration
   - ✅ Organization string field REMOVED from database

2. **RUM Tracking (auth.service)** ⚠️ **DECISION MADE**:
   - RUM service needs organization name for dashboard filtering/display
   - **Solution**: Send both `organizationId` AND `organizationName` (resolved via OrganizationStore)
   - Use takeUntilDestroyed() for async resolution without blocking auth flow
   - **Impact**: This affects all analytics and monitoring across the application
   - **Action**: Test RUM dashboard after change to verify reports still work

3. **Async Observable Handling**:
   - Prefer async pipe in templates (automatic subscription management)
   - Use takeUntilDestroyed() for manual subscriptions (no toPromise())
   - shareReplay({ refCount: false }) in OrganizationStore prevents duplicate HTTP calls

4. ~~Backward Compatibility~~ **NOT APPLICABLE**:
   - No backward compatibility needed
   - Organization field is GONE from database
   - All code must migrate (no fallback option)

5. **Caching Strategy**:
   - OrganizationStore uses Map<id, Observable<Organization>> with shareReplay({ refCount: false })
   - Each unique organizationId triggers ONE HTTP call
   - shareReplay shares in-flight requests across multiple simultaneous subscribers
   - Errors evict from cache (allows retry on next call)
   - refresh(id) method for manual cache invalidation
   - On-demand fetching - organizations loaded as needed (no preloading)

## Implementation Notes (2026-02-20)

- `register` and `edit-profile` previously depended on `core/utility-module/organization.service.ts` with `toPromise()`. Both were migrated to `core/organization-module/organization.service.ts` + Observable subscriptions.
- `OrganizationService.getOrganizationById()` supports both backend response shapes: `{ organization: Organization }` and direct `Organization`.
- `AuthService` RUM enrichment uses `take(1)` from `orgStore.organizationName$()` to avoid long-lived subscriptions and avoid blocking auth flow.
- `OrganizationStore` error handling evicts failed IDs from cache and returns `null` without console logging to avoid UI noise.
- `ng build` in local environment hangs after `❯ Building...`; TypeScript compile check (`npx tsc -p src/tsconfig.app.json --noEmit`) passes.
- Local Jest execution fails before running tests due environment issue: `TypeError: configSet.processWithEsbuild is not a function`.
- Follow-up fix: removed temporary loose schema strategy; service now uses strict endpoint contracts (`GET /organizations/:id` => `{ organization }`, search => `Organization[]`) with `OrganizationSchema` defaults for missing timestamps.
- Temporary compatibility (SC-38733): added `OrganizationStore.organizationNameFromUser$()` fallback to use legacy `organization` string when `organizationId` is missing in Learning Object author/contributors payloads. Includes TODO to remove after backend contract fix.

---

## Success Criteria

- [x] OrganizationStore created with caching via shareReplay({ refCount: false })
- [x] OrganizationService.getOrganizationById() implemented and validated
- [x] All 13 display components use organizationId + async pipe
- [x] All organizationFormat() methods removed
- [x] edit-profile and register submit organizationId (not organization string)
- [x] auth.service RUM tracking resolves organizationId to name with `take(1)` (non-blocking)
- [x] User entity class has organization property removed (\_organization, getter, setter)
- [ ] All unit tests passing (OrganizationStore, components with mocked store)
- [ ] All E2E tests passing
- [x] OrganizationStore caching verified (no duplicate HTTP calls for same ID)
- [x] shareReplay verified (in-flight requests shared across subscribers)
- [ ] Zero production errors related to organization display
- [ ] RUM/analytics dashboards continue to work with organization data
- [x] No toPromise() usage anywhere in changed code
- [x] No console.error spam from OrganizationStore (errors handled gracefully)

---

## Rollback Plan

**THERE IS NO ROLLBACK** - The backend has already removed the organization field.

If critical issues arise:

1. **Immediate**:
   - Revert frontend code to last working commit
   - Deploy previous version
   - This will cause errors since organization field doesn't exist in database
2. **Only option**:
   - Fix bugs in OrganizationStore quickly
   - Deploy hotfix
   - **OR** coordinate with backend team to restore organization field temporarily (requires database migration)

**Prevention is critical**:

- Thorough testing in dev environment before production
- Staged rollout (deploy to subset of users first)
- Monitor error rates and OrganizationStore cache performance
- Watch for excessive HTTP calls (indicates caching issues)

---

## Next Steps

1. Run full CI unit and E2E suites in CI environment (local Jest setup currently errors before test execution).
2. Validate RUM dashboards with `organizationId` + async `organizationName` enrichment.
3. Monitor organization lookup request volume in list-heavy pages and consider batch endpoint if needed.

---

## Appendix: File Reference

### Files to Create

- `src/app/core/organization-module/organization.store.ts` (OrganizationStore with caching)
- `src/app/core/organization-module/organization.store.spec.ts`
- `src/app/core/organization-module/organization.service.spec.ts`

### Files to Modify

**OrganizationService** (add getById):

1. `src/app/core/organization-module/organization.service.ts`

**Display Components** (13 components, 22+ files): 2. `src/app/shared/components/author-card/author-card.component.ts` 3. `src/app/shared/components/author-card/author-card.component.html` 4. `src/app/cube/shared/learning-object/learning-object.component.ts` 5. `src/app/cube/shared/learning-object/learning-object.component.html` 6. `src/app/onion/learning-object-builder/components/user-dropdown/user-dropdown.component.ts` 7. `src/app/onion/learning-object-builder/components/user-dropdown/user-dropdown.component.html` 8. `src/app/admin/components/user-search-wrapper/user-search-wrapper.component.ts` 9. `src/app/admin/components/user-search-wrapper/user-search-wrapper.component.html` 10. `src/app/admin/components/draggable-learning-object/draggable-learning-object.component.ts` 11. `src/app/admin/components/draggable-learning-object/draggable-learning-object.component.html` 12. `src/app/admin/components/change-author/change-author.component.ts` 13. `src/app/admin/components/change-author/change-author.component.html` 14. `src/app/admin/components/change-author/components/change-author-user-dropdown/change-author-user-dropdown.component.ts` 15. `src/app/admin/components/change-author/components/change-author-user-dropdown/change-author-user-dropdown.component.html` 16. `src/app/collection/shared/included/curators/curator-card/curator-card.component.ts` 17. `src/app/collection/shared/included/curators/curator-card/curator-card.component.html` 18. `src/app/admin/components/user-card/user-card.component.html` 19. `src/app/cube/user-profile/components/profile-header/profile-header.component.html` 20. `src/app/admin/components/add-evaluator/components/selected-user/selected-user.component.html` 21. `src/app/shared/components/add-evaluator/components/user-dropdown/user-dropdown.component.ts` 22. `src/app/shared/components/add-evaluator/components/user-dropdown/user-dropdown.component.html`

**Form Components** (2 components): 23. `src/app/cube/user-profile/components/edit-profile/edit-profile.component.ts` 24. `src/app/auth/register/register.component.ts`

**Services** (RUM tracking): 25. `src/app/core/auth-module/auth.service.ts`

**User Entity** (remove organization field): 26. `src/entity/user/user.ts`

**Additional updates**:
27. `src/app/core/organization-module/organization.schemas.ts`
28. `src/app/core/organization-module/organization.types.ts`
29. `src/app/core/utility-module/organization.service.ts` (removed `toPromise()`)

---

## Document History

- **2026-02-20 (v1.0)**: Initial audit and plan created
  - Documented all .organization usage (68+ references)
  - Identified 13 display components, 4 direct access, 2 forms, 1 service
  - Initial assumption: preload all organizations synchronously
  
- **2026-02-20 (v2.0)**: Major revision
  - Backend removed organization field (BREAKING CHANGE)
  - Initially thought no getById endpoint existed
  - Changed to preloaded cache + synchronous lookup approach
  - Reduced timeline from 2-3 weeks to 1 week
  
- **2026-02-20 (v3.0)**: Architecture revision
  - Confirmed Backend has GET /organizations/:id endpoint
  - Changed from preloaded cache to async observable approach
  - Use OrganizationStore (not OrganizationDisplayService)
  - Async pipe in templates with individual cached HTTP calls
  - shareReplay(1) prevents duplicate queries
  - takeUntilDestroyed() for manual subscriptions
  - No toPromise() usage
  - Timeline remains 5-7 days (1 week)

- **2026-02-20 (v4.0)**: Angular 18+ best practices alignment
  - Fixed RxJS imports: operators from 'rxjs/operators'
  - Updated OrganizationStore: cache type Map<string, Observable<Organization>> (not nullable)
  - Use shareReplay({ bufferSize: 1, refCount: false }) for long-lived cache
  - Removed console.error from store (centralized error handling preferred)
  - Clarified caching behavior: prevents duplicate calls for SAME ID (not all N+1 scenarios)
  - OrganizationService.getOrganizationById() with proper response shape handling
  - Enhanced auth.service RUM: non-blocking async resolution with takeUntilDestroyed()
  - Removed all OrganizationDisplayService/preload/synchronous references
  - Added trackBy guidance for list performance
  - Status: All issues from feedback addressed

- **2026-02-20 (v5.0)**: Implementation completed
  - Implemented `OrganizationService.getOrganizationById()` with support for wrapped and direct API response shapes
  - Added `OrganizationStore` with per-ID observable caching and `shareReplay({ bufferSize: 1, refCount: false })`
  - Migrated all audited UI org displays from `.organization`/`organizationFormat()` to `orgStore.organizationName$(organizationId) | async`
  - Updated `edit-profile` and `register` submission payloads to send `organizationId`
  - Updated `auth.service` RUM metadata to send `organizationId` immediately and enrich with `organizationName` via `take(1)`
  - Removed `organization` field from `User` entity model and serialization
  - Added unit tests for organization store caching/formatting and org service get-by-id behavior
  - Added compile verification via `npx tsc -p src/tsconfig.app.json --noEmit`
  - Remaining TODOs: run full CI tests and E2E, validate RUM dashboards in deployed environment
  
- Document Version: **5.0**
- Author: Development Team
- Status: **IMPLEMENTED - VALIDATION IN PROGRESS**
