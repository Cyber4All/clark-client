import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { AuthService } from "../auth-module/auth.service";
import { ToastrOvenService } from "../../shared/modules/toaster/notification.service";
import { DOWNLOAD_HISTORY_ROUTE } from "./library.routes";
import { LibraryService } from "./library.service";

describe("LibraryService", () => {
    let service: LibraryService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                LibraryService,
                {
                    provide: AuthService,
                    useValue: {
                        user: {
                            username: "rakesh",
                        },
                    },
                },
                {
                    provide: ToastrOvenService,
                    useValue: {
                        warning: jest.fn(),
                    },
                },
            ],
        });

        service = TestBed.inject(LibraryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("gets download history with page and limit", async () => {
        const response = {
            items: [],
            total: 125,
            page: 2,
            limit: 20,
            totalPages: 7,
            hasNextPage: true,
            hasPreviousPage: true,
        };
        const request = service.getDownloadHistory({
            page: 2,
            limit: 20,
            availableOnly: true,
        });

        const httpRequest = httpMock.expectOne(
            (req) =>
                req.urlWithParams ===
                `${environment.apiURL}/users/download-history?page=2&limit=20&availableOnly=true`,
        );
        expect(httpRequest.request.method).toBe("GET");
        expect(httpRequest.request.withCredentials).toBe(true);
        httpRequest.flush(response);

        await expect(request).resolves.toEqual(response);
    });

    it("exposes no retired Library endpoint helpers", () => {
        expect(Object.keys(DOWNLOAD_HISTORY_ROUTE)).toEqual([
            "GET_DOWNLOAD_HISTORY",
        ]);
    });
});
