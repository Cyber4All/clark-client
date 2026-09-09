import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { AuthService } from "../auth-module/auth.service";
import { ToastrOvenService } from "../../shared/modules/toaster/notification.service";
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

    it("gets download history with limit and cursor", async () => {
        const response = {
            items: [],
            nextCursor: "next-cursor",
        };
        const request = service.getDownloadHistory({
            limit: 20,
            cursor: "cursor-1",
        });

        const httpRequest = httpMock.expectOne(
            (req) =>
                req.urlWithParams ===
                `${environment.apiURL}/users/download-history?limit=20&cursor=cursor-1`,
        );
        expect(httpRequest.request.method).toBe("GET");
        expect(httpRequest.request.withCredentials).toBe(true);
        httpRequest.flush(response);

        await expect(request).resolves.toEqual(response);
    });
});
