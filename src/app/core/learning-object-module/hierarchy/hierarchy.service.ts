import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HIERARCHY_ROUTES } from "./hierarchy.routes";
import { LearningObject } from "@entity";

/** Filters for searching released learning objects that can be linked to a parent. */
export interface HierarchyLinkCandidateQuery {
    /** The learning object that would become the parent of the linked object. */
    parentId: string;
    /**
     * Root of the hierarchy being edited. The server leaves out everything
     * already inside it (siblings included), the parent, and the parent's
     * ancestors. Without it only the parent's own subtree is considered.
     */
    hierarchyRootId?: string;
    /** Free text; the server needs at least 3 characters. */
    text?: string;
    /** Only these lengths (the server also drops lengths invalid for the parent). */
    length?: LearningObject.Length[];
    /** Only objects with any of these topic ids. */
    topics?: string[];
    /** 1-based page. */
    currPage?: number;
    limit?: number;
}

/** One page of link candidates. */
export interface HierarchyLinkCandidatePage {
    learningObjects: LearningObject[];
    /** Candidates across all pages. */
    total: number;
}

@Injectable({
    providedIn: "root",
})
export class HierarchyService {
    constructor(private http: HttpClient) {}

    async addHierarchyObject(
        username: string,
        object: LearningObject,
    ): Promise<any> {
        return this.http
            .post(
                HIERARCHY_ROUTES.ADD_NEW_HIERARCHY_OBJECT(),
                { object, username },
                { withCredentials: true, responseType: "json" },
            )
            .toPromise();
    }

    /**
     * Search released learning objects, from any author, that may be linked as
     * a read-only child of `query.parentId` (sc-40641). The server applies the
     * eligibility rules before counting and paging.
     */
    searchLinkCandidates(
        query: HierarchyLinkCandidateQuery,
    ): Observable<HierarchyLinkCandidatePage> {
        let params = new HttpParams().set("mode", "link");
        if (query.hierarchyRootId) {
            params = params.set("hierarchyRootId", query.hierarchyRootId);
        }
        if (query.text) {
            params = params.set("text", query.text);
        }
        for (const length of query.length ?? []) {
            params = params.append("length", length);
        }
        for (const topic of query.topics ?? []) {
            params = params.append("topics", topic);
        }
        params = params
            .set("currPage", String(query.currPage ?? 1))
            .set("limit", String(query.limit ?? 10));

        return this.http
            .get<{
                objects: unknown[];
                total: number;
            }>(HIERARCHY_ROUTES.GET_HIERARCHY_CANDIDATES(query.parentId), {
                params,
                withCredentials: true,
            })
            .pipe(
                map((response) => ({
                    learningObjects: (response.objects ?? []).map(
                        (object) => new LearningObject(object),
                    ),
                    total: response.total ?? 0,
                })),
            );
    }
}
