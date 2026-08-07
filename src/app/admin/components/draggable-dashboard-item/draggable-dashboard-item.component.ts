import { Component, OnInit, Input } from "@angular/core";
import { LearningObject } from "@entity";
import { NgClass, NgIf, TitleCasePipe, DatePipe } from "@angular/common";
import {
    getLearningObjectStatusIcon,
    getLearningObjectStatusLabel,
} from "app/shared/functions/learning-object-status";

@Component({
    selector: "clark-draggable-dashboard-item",
    templateUrl: "./draggable-dashboard-item.component.html",
    styleUrls: ["./draggable-dashboard-item.component.scss"],
    standalone: true,
    imports: [NgClass, NgIf, TitleCasePipe, DatePipe],
})
export class DraggableDashboardItemComponent implements OnInit {
    @Input() learningObject: LearningObject;
    @Input() disabled: boolean;
    constructor() {}

    async ngOnInit() {}

    get statusLabel(): string {
        return getLearningObjectStatusLabel(this.learningObject.status);
    }

    get statusIcon(): string {
        return getLearningObjectStatusIcon(this.learningObject.status);
    }
}
