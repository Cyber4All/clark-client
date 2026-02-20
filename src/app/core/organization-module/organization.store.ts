import { TitleCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.types';

@Injectable({
    providedIn: 'root'
})
export class OrganizationStore {
    private readonly cache = new Map<string, Observable<Organization>>();
    private readonly titleCasePipe = new TitleCasePipe();

    constructor(private readonly orgService: OrganizationService) { }

    organization$(id: string | null | undefined): Observable<Organization | null> {
        if (!id) {
            return of(null);
        }

        if (!this.cache.has(id)) {
            const organization$ = this.orgService
                .getOrganizationById(id)
                .pipe(
                    shareReplay({ bufferSize: 1, refCount: false }),
                );

            this.cache.set(id, organization$);
        }

        return this.cache.get(id)!.pipe(
            map((organization): Organization | null => organization),
            catchError(() => {
                this.cache.delete(id);
                return of(null);
            })
        );
    }

    organizationName$(id: string | null | undefined): Observable<string> {
        return this.organization$(id).pipe(
            map((organization) => organization ? this.formatOrgName(organization.name) : '')
        );
    }

    /**
     * TODO(SC-38733): Remove `organization` string fallback once LearningObject author/contributors
     * payloads consistently provide `organizationId`.
     */
    organizationNameFromUser$(
        user: { organizationId?: string | null; organization?: string | null } | null | undefined
    ): Observable<string> {
        const organizationId = user?.organizationId;
        if (organizationId) {
            return this.organizationName$(organizationId);
        }
        return of(this.formatOrgName(user?.organization));
    }

    refresh(id: string): void {
        this.cache.delete(id);
    }

    clear(): void {
        this.cache.clear();
    }

    private formatOrgName(name: string | null | undefined): string {
        const trimmed = name?.trim() ?? '';
        if (!trimmed) {
            return '';
        }

        if (trimmed.length > 1 && trimmed.charAt(1) === trimmed.charAt(1).toUpperCase()) {
            return trimmed;
        }

        return this.titleCasePipe.transform(trimmed);
    }
}
