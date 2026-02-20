import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import {
    CreateOrganizationResponseSchema,
    OrganizationArraySchema,
    SuggestDomainResponseSchema,
    UpdateOrganizationResponseSchema,
} from './organization.schemas';
import {
    CreateOrganizationRequest,
    CreateOrganizationResponse,
    Organization,
    SearchOrganizationsRequest,
    SuggestDomainResponse,
    UpdateOrganizationRequest,
    UpdateOrganizationResponse,
} from './organization.types';

/**
 * Service for organization HTTP operations
 * Uses Observables for all async operations with runtime validation via zod
 */
@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    /**
     * Cache for suggestDomain requests keyed by normalized email domain
     */
    private readonly suggestCache = new Map<string, Observable<SuggestDomainResponse>>();

    /**
     * Cache for searchOrganizations requests keyed by stringified normalized request
     */
    private readonly searchCache = new Map<string, Observable<Organization[]>>();

    constructor(private readonly http: HttpClient) { }

    /**
     * Private path helpers
     */
    private organizationsPath(): string {
        return `${environment.apiURL}/organizations`;
    }

    private suggestPath(): string {
        return `${environment.apiURL}/organizations/suggest`;
    }

    private updatePath(id: string): string {
        return `${environment.apiURL}/organizations/${encodeURIComponent(id)}`;
    }

    /**
     * Search for organizations with optional filters
     *
     * @param request Search parameters
     * @returns Observable of organization array
     */
    searchOrganizations(request: SearchOrganizationsRequest = {}): Observable<Organization[]> {
        // Normalize request for cache key
        const cacheKey = this.normalizeSearchRequest(request);

        // Check cache
        const cached = this.searchCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Build HTTP params
        let params = new HttpParams();
        if (request.text) {
            params = params.set('text', request.text.trim());
        }
        if (request.sector) {
            params = params.set('sector', request.sector);
        }
        if (request.levels && request.levels.length > 0) {
            // CSV format for levels
            params = params.set('levels', request.levels.join(','));
        }
        if (request.isVerified !== undefined) {
            params = params.set('isVerified', String(request.isVerified));
        }
        if (request.domain) {
            params = params.set('domain', request.domain);
        }
        if (request.page !== undefined) {
            params = params.set('page', String(request.page));
        }
        if (request.limit !== undefined) {
            params = params.set('limit', String(request.limit));
        }

        // Make request with validation and caching
        const request$ = this.http
            .get<Organization[]>(this.organizationsPath(), { params })
            .pipe(
                map(data => OrganizationArraySchema.parse(data)),
                catchError(error => {
                    // Evict cache on error
                    this.searchCache.delete(cacheKey);
                    return throwError(() => error);
                }),
                shareReplay({ bufferSize: 1, refCount: false })
            );

        // Store in cache
        this.searchCache.set(cacheKey, request$);

        return request$;
    }

    /**
     * Suggest organization based on email domain
     *
     * @param email User email address
     * @returns Observable of suggest response
     */
    suggestDomain(email: string): Observable<SuggestDomainResponse> {
        // Normalize email domain for cache key
        const cacheKey = this.normalizeEmailDomain(email);

        // Check cache
        const cached = this.suggestCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Build HTTP params
        const params = new HttpParams().set('email', email);

        // Make request with validation and caching
        const request$ = this.http
            .get<SuggestDomainResponse>(this.suggestPath(), { params })
            .pipe(
                map(data => SuggestDomainResponseSchema.parse(data)),
                catchError(error => {
                    // Evict cache on error
                    this.suggestCache.delete(cacheKey);
                    return throwError(() => error);
                }),
                shareReplay({ bufferSize: 1, refCount: false })
            );

        // Store in cache
        this.suggestCache.set(cacheKey, request$);

        return request$;
    }

    /**
     * Create a new organization
     *
     * @param request Organization data
     * @returns Observable of created organization response
     */
    createOrganization(request: CreateOrganizationRequest): Observable<CreateOrganizationResponse> {
        return this.http
            .post<CreateOrganizationResponse>(this.organizationsPath(), request)
            .pipe(
                map(data => CreateOrganizationResponseSchema.parse(data)),
                catchError(error => throwError(() => error))
            );
    }

    /**
     * Update an existing organization
     *
     * @param id Organization ID
     * @param request Update data
     * @returns Observable of updated organization response
     */
    updateOrganization(id: string, request: UpdateOrganizationRequest): Observable<UpdateOrganizationResponse> {
        return this.http
            .patch<UpdateOrganizationResponse>(this.updatePath(id), request)
            .pipe(
                map(data => UpdateOrganizationResponseSchema.parse(data)),
                catchError(error => throwError(() => error))
            );
    }

    /**
     * Clear all caches (useful after create/update operations)
     */
    clearCache(): void {
        this.searchCache.clear();
        this.suggestCache.clear();
    }

    /**
     * Private helper: Normalize search request for stable cache key
     */
    private normalizeSearchRequest(request: SearchOrganizationsRequest): string {
        const normalized = {
            text: request.text?.trim() || undefined,
            sector: request.sector || undefined,
            levels: request.levels?.slice().sort((a, b) => a.localeCompare(b)).join(',') || undefined,
            isVerified: request.isVerified,
            domain: request.domain || undefined,
            page: request.page,
            limit: request.limit,
        };
        return JSON.stringify(normalized);
    }

    /**
     * Private helper: Normalize email domain for cache key
     */
    private normalizeEmailDomain(email: string): string {
        const normalized = email.toLowerCase().trim();
        const atIndex = normalized.indexOf('@');
        if (atIndex === -1) {
            return normalized;
        }
        return normalized.substring(atIndex);
    }
}
