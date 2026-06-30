import { Component, OnInit, Input } from "@angular/core";
import { MatCard } from "@angular/material/card";
import { NgClass, NgIf, DatePipe } from "@angular/common";
import { LengthComponent } from "../../../../../cube/details/components/splash/components/length/length.component";
import { RatingStarsComponent } from "../../../../../shared/components/rating-stars/rating-stars.component";
import { RouterLink } from "@angular/router";

@Component({
    selector: "clark-cyberskills-card",
    templateUrl: "./cyberskills-card.component.html",
    styleUrls: ["./cyberskills-card.component.scss"],
    standalone: true,
    imports: [
        MatCard,
        NgClass,
        NgIf,
        LengthComponent,
        RatingStarsComponent,
        RouterLink,
        DatePipe,
    ],
})
export class CyberskillsCardComponent implements OnInit {
    @Input() learningObject: any;
    @Input() statusDescription = "";

    constructor() {}

    ngOnInit(): void {}
}
