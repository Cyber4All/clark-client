import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { LearningObject } from "@entity";
import { LearningObjectListingComponent } from "../../../shared/learning-object/learning-object.component";

@Component({
    selector: "clark-profile-learning-objects",
    templateUrl: "./profile-learning-objects.component.html",
    styleUrls: ["./profile-learning-objects.component.scss"],
    standalone: true,
    imports: [NgIf, NgFor, LearningObjectListingComponent],
})
export class ProfileLearningObjectsComponent {
    @Input() learningObjects: LearningObject[] = [];
    @Input() loading = false;
    @Input() failed = false;
    @Output() retry = new EventEmitter<void>();
}
