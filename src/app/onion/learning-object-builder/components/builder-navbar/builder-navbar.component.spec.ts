import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { BuilderNavbarComponent } from "./builder-navbar.component";
import { LearningObject } from "@entity";

describe("BuilderNavbarComponent", () => {
    let component: BuilderNavbarComponent;
    let fixture: ComponentFixture<BuilderNavbarComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [BuilderNavbarComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BuilderNavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});

describe("BuilderNavbarComponent AI material eligibility", () => {
    let component: BuilderNavbarComponent;

    const material = (extension: string): LearningObject.Material.File => ({
        _id: "507f1f77bcf86cd799439011",
        name: `Material.${extension}`,
        extension,
        fileType: "application/octet-stream",
        date: "2026-10-27",
    });

    beforeEach(() => {
        // Test eligibility without starting unrelated collection and save subscriptions.
        component = Object.create(BuilderNavbarComponent.prototype);
        component.learningObject = new LearningObject();
        component.showAgenticBuilder = false;
        component.hasReadyAiMaterials = false;
    });

    it.each(["docx", "html", "md", "pdf", "pptx", "txt", "xlsx", "PDF"])(
        "enables generation for supported metadata extension %s",
        (extension) => {
            component.learningObject.materials.files = [material(extension)];
            expect(component.hasSupportedMaterials).toBe(true);
            expect(component.canGenerateWithAi).toBe(false);
            component.toggleAgenticBuilder();
            expect(component.showAgenticBuilder).toBe(false);
            component.hasReadyAiMaterials = true;
            component.toggleAgenticBuilder();
            expect(component.showAgenticBuilder).toBe(true);
        },
    );

    it.each(["flac", "mp3", "zip", "png", "doc", ""])(
        "keeps generation disabled for unsupported metadata extension %s",
        (extension) => {
            component.learningObject.materials.files = [material(extension)];
            expect(component.hasSupportedMaterials).toBe(false);
            component.toggleAgenticBuilder();
            expect(component.showAgenticBuilder).toBe(false);
        },
    );

    it("requires a supported file even when material URLs exist", () => {
        component.learningObject.materials.urls = [
            { title: "Materials", url: "https://example.com/materials.pdf" },
        ];
        expect(component.hasSupportedMaterials).toBe(false);
    });

    it("handles an object that has not loaded yet", () => {
        const unloaded = Object.create(
            BuilderNavbarComponent.prototype,
        ) as BuilderNavbarComponent;
        expect(unloaded.hasSupportedMaterials).toBe(false);
    });

    it("allows mixed files and disables after the last supported file is removed", () => {
        component.learningObject.materials.files = [
            material("flac"),
            material("pdf"),
        ];
        expect(component.hasSupportedMaterials).toBe(true);
        component.learningObject.materials.files = [material("flac")];
        expect(component.hasSupportedMaterials).toBe(false);
    });
});
