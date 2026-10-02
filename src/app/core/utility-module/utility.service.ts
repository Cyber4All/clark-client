import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "@env/environment";
import { Injectable } from "@angular/core";
import { UTILITY_ROUTES } from "./utility.routes";
import { AuthService } from "../auth-module/auth.service";
import { Observable, throwError } from "rxjs";
import { Blog } from "app/components/blogs/types/blog";
import { catchError } from "rxjs/operators";

export class Downtime {
    constructor(
        public isDown: boolean,
        public message: string,
    ) {}
}

// putting this here now, will probably move it later
// evaluate later if I need the export
export interface ExternalLinkOptions {
    bypassConfirmation?: boolean;
    confirmationMessage?: string;
    target?: "_blank" | "_self";
    windowFeatures?: string;
}

@Injectable({
    providedIn: "root",
})
export class UtilityService {
    constructor(
        private http: HttpClient,
        private auth: AuthService,
    ) {}

    private _downtime: Downtime;

    get message() {
        return this._downtime;
    }

    /**
     * Gets all blogs from the database
     *
     * @returns An observable containing an array of blogs
     */
    getAllBlogs(): Observable<Blog[]> {
        return this.http.get<Blog[]>(UTILITY_ROUTES.GET_BLOGS());
    }

    /**
     * Gets all blogs from the database
     *
     * @returns An observable containing an array of blogs
     */
    getRecentBlogs(): Observable<Blog[]> {
        return this.http.get<Blog[]>(UTILITY_ROUTES.GET_RECENT_BLOGS());
    }

    /**
     * Checks the client's version against the service
     *
     * @returns {Promise<void>}
     * @memberof AuthService
     */
    async checkClientVersion(): Promise<void | Partial<{ message: string }>> {
        // Application version information
        const { version } = require("../../../../package.json");
        try {
            await this.http
                .get(UTILITY_ROUTES.GET_CLIENT_VERSION(version), {
                    withCredentials: true,
                    responseType: "text",
                })
                .toPromise();
            return Promise.resolve();
        } catch (error) {
            if (error.status === 426) {
                return Promise.reject(error);
            } else {
                catchError(this.handleError);
            }
        }
    }

    /**
     * Gets all CARD resources
     * @returns list of card resources
     */
    async getAllResources(args?: {
        q?: string;
        page?: number;
        limit?: number;
        sort?: 1 | -1;
        sortType?: string;
        category?: string[];
        organizations?: string[];
        status?: string[];
    }): Promise<any> {
        const apiBase = this.getApiBase();
        return new Promise((resolve, reject) => {
            this.http
                .get(`${apiBase}/resources`, {})
                .toPromise()
                .then(
                    (res: any) => {
                        resolve(res);
                    },
                    (err) => {
                        reject(err);
                    },
                );
        });
    }

    async getOrganizations(): Promise<any> {
        const apiBase = this.getApiBase();
        return new Promise((resolve, reject) => {
            this.http
                .get(`${apiBase}/organizations`, {})
                .toPromise()
                .then(
                    (res: any) => {
                        resolve(res);
                    },
                    (err) => {
                        reject(err);
                    },
                );
        });
    }

    getDowntime(): Promise<Downtime> {
        return this.http
            .get(UTILITY_ROUTES.GET_DOWNTIME(), { withCredentials: true })
            .pipe(catchError(this.handleError))
            .toPromise()
            .then((val: Downtime) => {
                return val;
            });
    }

    // so the Microsoft viewer wants this to be static to use it
    // look into how static will affect other things
    // however, changing it to static broke other things so this will prob require some refactoring
    // at first look, it seems like the static change won't break anything crazy, but I do need to figure out what stopped
    // client from compiling when I made that change---that is something for later, i.e. not today
    public openExternalLink(url: string, options?: ExternalLinkOptions) {
        // Ask the user if they are sure they want to leave
        // not sure that this is doing what I would like it to
        if (options?.bypassConfirmation) {
            window.open(
                url,
                options?.target ?? "_blank",
                "noopener,noreferrer",
            );
        } else if (
            window.confirm(
                options?.confirmationMessage ??
                    "You are now leaving CLARK. You will be redirected to the external link.",
            )
        ) {
            window.open(
                url,
                options?.target ?? "_blank",
                "noopener,noreferrer",
            );
        }
        // if (
        //     confirm(
        //         "You are now leaving CLARK. You will be redirected to the CAE Resource Directory.",
        //     )
        // ) {
        //     window.open("https://caeresource.clark.center", "_blank");
        // }
    }

    private handleError(error: HttpErrorResponse | any) {
        if (
            error.error instanceof ErrorEvent ||
            (error.error && error.error.message)
        ) {
            // Client-side or network returned error
            return throwError(error.error);
        } else {
            // API returned error
            return throwError(error.error);
        }
    }

    private getApiBase(): string {
        const apiBase = environment.apiURL?.trim();
        if (!apiBase) {
            throw new Error("API URL is not configured for this environment.");
        }
        return apiBase;
    }
}
