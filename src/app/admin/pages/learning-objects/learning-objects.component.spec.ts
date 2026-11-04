import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { LearningObjectsComponent } from "./learning-objects.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import {
    provideHttpClient,
    withInterceptorsFromDi,
} from "@angular/common/http";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { AuthService } from "app/core/auth-module/auth.service";
import { CollectionService } from "app/core/collection-module/collections.service";
import { of } from "rxjs";
import { ActivatedRoute } from "@angular/router";

describe("LearningObjectsComponent", () => {
    let component: LearningObjectsComponent;
    let fixture: ComponentFixture<LearningObjectsComponent>;

    class ActivatedRouteStub {
        public parent = {
            params: of({}),
        };

        public queryParams = of({});
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            teardown: { destroyAfterEach: false },
            imports: [RouterTestingModule, LearningObjectsComponent],
            providers: [
                ToastrOvenService,
                AuthService,
                CollectionService,
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                provideHttpClient(withInterceptorsFromDi()),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should not throw when the headers element is not rendered", () => {
        jest.useFakeTimers();
        try {
            component.learningObjects = [];
            component.headersElement = undefined;
            component.ngAfterViewInit();
            expect(() => jest.advanceTimersByTime(2000)).not.toThrow();
            expect(component.listViewHeightOffset).toBeUndefined();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should clear the pending measurement timer on destroy", () => {
        jest.useFakeTimers();
        try {
            component.ngAfterViewInit();
            component.ngOnDestroy();
            component.listElement = undefined;
            expect(() => jest.advanceTimersByTime(2000)).not.toThrow();
        } finally {
            jest.useRealTimers();
        }
    });
});
