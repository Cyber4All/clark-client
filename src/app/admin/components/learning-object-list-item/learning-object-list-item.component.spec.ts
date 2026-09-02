import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { LearningObjectListItemComponent } from "./learning-object-list-item.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { ContextMenuModule } from "app/shared/modules/contextmenu/contextmenu.module";
import {
    provideHttpClient,
    withInterceptorsFromDi,
} from "@angular/common/http";
import { AuthService } from "app/core/auth-module/auth.service";
import { LearningObject } from "@entity";
import { CollectionService } from "app/core/collection-module/collections.service";
import { SharedDirectivesModule } from "app/shared/directives/shared-directives.module";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { EditorialService } from "app/core/learning-object-module/editorial.service";
import { StatusDescriptions } from "environments/status-descriptions";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";

describe("DashboardItemComponent", () => {
    let component: LearningObjectListItemComponent;
    let fixture: ComponentFixture<LearningObjectListItemComponent>;
    let learningObjectService: {
        getLearningObjectParents: jest.Mock;
        getLearningObjectChildren: jest.Mock;
        updateLearningObjectStatus: jest.Mock;
        releaseHierarchy: jest.Mock;
    };

    beforeEach(waitForAsync(() => {
        learningObjectService = {
            getLearningObjectParents: jest.fn().mockResolvedValue([]),
            getLearningObjectChildren: jest.fn().mockResolvedValue([]),
            updateLearningObjectStatus: jest.fn().mockResolvedValue({}),
            releaseHierarchy: jest.fn().mockResolvedValue({}),
        };

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            teardown: { destroyAfterEach: false },
            imports: [
                RouterTestingModule,
                ContextMenuModule.forRoot(),
                SharedDirectivesModule,
                LearningObjectListItemComponent,
            ],
            providers: [
                {
                    provide: AuthService,
                    useValue: { user: { accessGroups: ["admin"] } },
                },
                CollectionService,
                {
                    provide: LearningObjectService,
                    useValue: learningObjectService,
                },
                {
                    provide: EditorialService,
                    useValue: {
                        navigateToEditor: jest.fn(),
                        deleteRevision: jest.fn().mockResolvedValue({}),
                    },
                },
                {
                    provide: StatusDescriptions,
                    useValue: {
                        getDescription: jest.fn().mockResolvedValue("Released"),
                    },
                },
                {
                    provide: ToastrOvenService,
                    useValue: {
                        success: jest.fn(),
                        error: jest.fn(),
                    },
                },
                provideHttpClient(withInterceptorsFromDi()),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LearningObjectListItemComponent);
        component = fixture.componentInstance;
        component.learningObject = {
            cuid: "clark-example-cuid",
            status: LearningObject.Status.RELEASED,
            name: "Example Learning Object",
            author: { name: "Test Author" },
            length: LearningObject.Length.NANOMODULE,
            date: "2026-08-31",
        } as LearningObject;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("shows the learning object cuid in the unrelease contact message", () => {
        component.toggleUnreleaseConfirm(true);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain(
            "Learning objects can no longer be unreleased from the admin dashboard",
        );
        expect(fixture.nativeElement.textContent).toContain(
            "clark-example-cuid",
        );
    });

    it("does not call the status update endpoint from the unrelease modal", () => {
        component.toggleUnreleaseConfirm(true);
        fixture.detectChanges();

        const closeButton: HTMLButtonElement =
            fixture.nativeElement.querySelector(".btn-group button");
        closeButton.click();
        fixture.detectChanges();

        expect(
            learningObjectService.updateLearningObjectStatus,
        ).not.toHaveBeenCalled();
        expect(component.showUnreleaseConfirm).toBe(false);
    });
});
