import { Component, OnInit, Input } from "@angular/core";
import { LearningObject } from "@entity";
import { NgIf, NgFor } from "@angular/common";
import { LearningObjectListingComponent } from "../../../../../../shared/learning-object/learning-object.component";

@Component({
    selector: "clark-side-panel-content",
    templateUrl: "./side-panel-content.component.html",
    styleUrls: ["./side-panel-content.component.scss"],
    standalone: true,
    imports: [NgIf, NgFor, LearningObjectListingComponent],
})
export class SidePanelContentComponent implements OnInit {
    @Input() parents: LearningObject[];
    @Input() children: LearningObject[];

    constructor() {}

    ngOnInit() {}
}
