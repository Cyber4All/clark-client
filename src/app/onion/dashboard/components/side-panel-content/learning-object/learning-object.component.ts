import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { LearningObject } from "@entity";
import { TipDirective } from "../../../../../shared/directives/tip.directive";
import {
    NgClass,
    NgStyle,
    AsyncPipe,
    SlicePipe,
    TitleCasePipe,
    DatePipe,
} from "@angular/common";
import { CollectionPipe } from "../../../../../shared/pipes/collection.pipe";

@Component({
    selector: "clark-panel-learning-object",
    templateUrl: "./learning-object.component.html",
    styleUrls: ["./learning-object.component.scss"],
    standalone: true,
    imports: [
        TipDirective,
        NgClass,
        NgStyle,
        AsyncPipe,
        SlicePipe,
        TitleCasePipe,
        DatePipe,
        CollectionPipe,
    ],
})
export class LearningObjectComponent implements OnInit {
    @Input() learningObject: LearningObject;

    constructor() {}

    ngOnInit() {}
    get collectionImage() {
        return `${this.learningObject.collection}.png`;
    }
}
