import { TestBed } from "@angular/core/testing";
import {
    createPlaylistMetadataForm,
    PlaylistMetadataFormComponent,
} from "./playlist-metadata-form.component";

describe("PlaylistMetadataFormComponent", () => {
    it("uses the shared form for creation and editing with explicit action labels", () => {
        const fixture = TestBed.createComponent(PlaylistMetadataFormComponent);
        const component = fixture.componentInstance;
        component.form = createPlaylistMetadataForm();
        component.form.controls.name.setValue("Playlist title");
        fixture.detectChanges();
        const element: HTMLElement = fixture.nativeElement;
        const submit = element.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
        );
        expect(element.querySelector("h2").textContent).toContain(
            "Add playlist",
        );
        expect(submit.textContent).toContain("Create playlist");
        expect(
            element.querySelector('label[for="playlist-metadata-description"]')
                .textContent,
        ).toContain("Description (optional)");
        expect(element.querySelector("textarea").hasAttribute("required")).toBe(
            false,
        );

        const submitted = jest.spyOn(component.submitted, "emit");
        const cancelled = jest.spyOn(component.cancelled, "emit");
        component.editing = true;
        fixture.detectChanges();
        expect(element.querySelector("h2").textContent).toContain(
            "Edit playlist",
        );
        expect(submit.textContent.trim()).toBe("Save");
        submit.click();
        element
            .querySelector<HTMLButtonElement>('button[type="button"]')
            .click();
        expect(submitted).toHaveBeenCalledTimes(1);
        expect(cancelled).toHaveBeenCalledTimes(1);

        component.saving = true;
        fixture.detectChanges();
        expect(submit.textContent).toContain("Saving…");
        expect(submit.disabled).toBe(true);
        expect(
            element.querySelector<HTMLButtonElement>('button[type="button"]')
                .disabled,
        ).toBe(true);
        fixture.destroy();
    });
});
