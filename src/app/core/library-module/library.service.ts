import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
    HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { ToastrOvenService } from "../../shared/modules/toaster/notification.service";
import { AuthService } from "../auth-module/auth.service";
import { DOWNLOAD_HISTORY_ROUTE } from "./library.routes";
import { environment } from "@env/environment";
import { FileService } from "app/core/learning-object-module/file/file.service";
import { LearningObject } from "@entity";

export type DownloadType = "file" | "bundle";

export interface DownloadHistoryItem {
    name: string;
    title?: string;
    fileName?: string;
    filePath?: string;
    downloadedAt: string;
    downloadedBy: string;
    type: DownloadType;
    available: boolean;
    resource: {
        learningObjectId: string;
        cuid: string;
        version: number;
    } | null;
}

export interface DownloadHistoryResponse {
    items: DownloadHistoryItem[];
    nextCursor?: string;
}

@Injectable({
    providedIn: "root",
})
export class LibraryService {
    private user;
    private headers = new HttpHeaders();

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        public toaster: ToastrOvenService,
    ) {
        this.updateUser();
    }

    /**
     * Method to update the user object and headers with the latest user information
     */
    updateUser() {
        // get new user from auth service
        this.user = this.auth.user || undefined;

        // reset headers with new users auth token
        this.headers = new HttpHeaders();
    }

    async getDownloadHistory(opts: {
        limit?: number;
        cursor?: string;
    }): Promise<DownloadHistoryResponse> {
        this.updateUser();
        if (!this.user) {
            return { items: [] };
        }

        const query = new URLSearchParams({
            limit: opts.limit ? opts.limit.toString() : "20",
        });

        if (opts.cursor) {
            query.set("cursor", opts.cursor);
        }

        return await this.http
            .get<DownloadHistoryResponse>(
                DOWNLOAD_HISTORY_ROUTE.GET_DOWNLOAD_HISTORY(query),
                {
                    withCredentials: true,
                    headers: this.headers,
                },
            )
            .pipe(catchError((error) => this.handleError(error)))
            .toPromise();
    }

    /**
     * Method to start bundle stream and download the zip file
     * @param url request to api for zip in stream
     * @returns void - blob stream is downloaded to user's machine
     */
    async downloadBundle(url: string): Promise<void> {
        return this.http
            .get(url, {
                responseType: "json",
                observe: "response",
                headers: this.headers,
                withCredentials: true,
            })
            .pipe(
                timeout(30000), // 30 seconds timeout
                catchError((error) => {
                    throw this.handleError(error);
                }),
            )
            .toPromise()
            .then((response: HttpResponse<{ url: string }>) => {
                /**
                 * We get the pre-signed download URL from the response body, check if it's empty,
                 * then open the download URL in a new tab and begin downloading the bundle from S3.
                 */
                const { url } = response.body;
                if (!url) {
                    // Ideally we should NEVER reach this null case, or else something has gone
                    // really wrong with S3 or clark-service, as we would 404 when an object does not exist.
                    throw this.handleError(
                        new HttpErrorResponse({
                            error: "No URL for content download",
                            status: 500,
                        }),
                    );
                }

                window.open(url);
            });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // Client-side or network returned error
            return throwError(error.error.message);
        } else if (error.status === 425) {
            // At time of implementation, 425 is recognized as an experimental status
            this.toaster.warning(
                "Hang Tight!",
                `The download for this learning object isn't ready yet, check back shortly to see if it has finished bundling.`,
            );
        } else {
            // API returned error
            return throwError(error);
        }
    }
}
