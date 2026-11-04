import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HIERARCHY_ROUTES } from "./hierarchy.routes";
import { HierarchyChildPayload } from "./hierarchy.types";
import { LearningObject } from "@entity";

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
     * Fetches the direct children of a learning object. Credentials are sent so
     * the author also receives children that are not released yet.
     *
     * @param learningObjectId id of the parent learning object
     */
    getChildren(learningObjectId: string): Observable<HierarchyChildPayload[]> {
        return this.http.get<HierarchyChildPayload[]>(
            HIERARCHY_ROUTES.GET_CHILDREN(learningObjectId),
            { withCredentials: true },
        );
    }
}
