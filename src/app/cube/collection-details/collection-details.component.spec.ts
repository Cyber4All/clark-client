import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CollectionDetailsComponent } from "./collection-details.component";
import { CollectionService } from "../../core/collection-module/collections.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Subject } from "rxjs";

describe("CollectionDetailsComponent", () => {
    let component: CollectionDetailsComponent;
    let fixture: ComponentFixture<CollectionDetailsComponent>;
    let collectionServiceSpy: jest.Mocked<CollectionService>;
    let routerSpy: jest.Mocked<Router>;

    beforeEach(async () => {
        collectionServiceSpy = {
            getCollectionMetadata: jest.fn(),
        } as any;

        routerSpy = {
            navigate: jest.fn(),
        } as any;

        await TestBed.configureTestingModule({
            imports: [CollectionDetailsComponent],
            providers: [
                { provide: CollectionService, useValue: collectionServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: { params: new Subject() },
                },
                { provide: Title, useValue: { setTitle: jest.fn() } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CollectionDetailsComponent);
        component = fixture.componentInstance;
    });

    describe("fetchCollection", () => {
        it("navigates to not-found and does not throw when API returns 404", async () => {
            collectionServiceSpy.getCollectionMetadata.mockReturnValue(
                Promise.reject({ status: 404 }) as any,
            );

            await expect(
                component.fetchCollection("nccp"),
            ).resolves.toBeUndefined();

            expect(routerSpy.navigate).toHaveBeenCalledWith(["not-found"]);
            expect(component.collection).toBeUndefined();
        });

        it("sets collection data when API returns successfully", async () => {
            const mockCollection = {
                abvName: "nccp",
                name: "NCCP Collection",
            };
            collectionServiceSpy.getCollectionMetadata.mockReturnValue(
                Promise.resolve(mockCollection) as any,
            );

            await component.fetchCollection("nccp");

            expect(component.collection).toEqual(mockCollection);
        });
    });
});
