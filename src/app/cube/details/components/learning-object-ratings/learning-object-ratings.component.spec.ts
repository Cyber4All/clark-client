import { SimpleChange } from "@angular/core";
import { AuthService } from "app/core/auth-module/auth.service";
import { UserService } from "app/core/user-module/user.service";
import { LearningObjectRatingsComponent } from "./learning-object-ratings.component";

describe("LearningObjectRatingsComponent", () => {
    it("collapses reviews when a refreshed ratings list arrives", () => {
        const component = new LearningObjectRatingsComponent(
            {} as UserService,
            {} as AuthService,
        );
        component.showMore = [true];

        component.ngOnChanges({
            ratings: new SimpleChange([], [{}], false),
        });

        expect(component.showMore).toEqual([]);
    });
});
