import { Component, OnInit, Input } from "@angular/core";
import { LearningObject } from "@entity";
import { RatingStarsComponent } from "../../../../../shared/components/rating-stars/rating-stars.component";

@Component({
    selector: "clark-metrics",
    templateUrl: "./metrics.component.html",
    styleUrls: ["./metrics.component.scss"],
    standalone: true,
    imports: [RatingStarsComponent],
})
export class MetricsComponent implements OnInit {
    @Input() learningObject: LearningObject;
    constructor() {}

    ngOnInit() {}
}
