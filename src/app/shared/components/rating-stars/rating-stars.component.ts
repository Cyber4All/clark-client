import {
    Component,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { NgStyle, NgFor, NgIf } from "@angular/common";
import { TipDirective } from "../../directives/tip.directive";
import { EventEmitter, Output } from "@angular/core";
import { ActivateDirective } from "../../directives/activate.directive";

@Component({
    selector: "clark-rating-stars",
    templateUrl: "./rating-stars.component.html",
    styleUrls: ["./rating-stars.component.scss"],
    standalone: true,
    imports: [NgStyle, TipDirective, NgFor, NgIf, ActivateDirective],
})
export class RatingStarsComponent implements OnInit, OnChanges {
    /**
     * Number of total stars
     */
    @Input() count = 5;

    /**
     * Number of rated stars
     */
    @Input() rating: number;

    /**
     * Number of reviews this rating is averaged from
     */
    @Input() reviewsCount: number;

    /**
     * Color to render the stars. [dark | blue | gold | white (default)]
     */
    @Input() color: string;

    /**
     * Font size to render the stars and text (default is 16px);
     */
    @Input() size: number;

    @Input() interactive = false;

    @Input() loggedIn: boolean;

    @Input() starTips: string[] = [];

    @Output() selectedRating = new EventEmitter<number>();

    iterableCount: number[];
    styles: { fontSize?: string } = {};

    activeHover = -1;

    constructor() {}

    ngOnInit() {
        this.iterableCount = Array(this.count).fill(0);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.count) {
            this.iterableCount = Array(changes.count.currentValue).fill(0);
        }

        if (changes.size) {
            this.styles.fontSize = changes.size.currentValue + "px";
        }
    }

    get roundedReview(): number {
        return parseFloat((this.rating ?? 0).toFixed(1));
    }

    get calculateBarWidth(): string {
        const displayedRating =
            this.activeHover > -1 ? this.activeHover + 1 : (this.rating ?? 0);
        // subtracting 2px from full bar appears to achieve closest result
        return `calc(${(displayedRating / this.count) * 100}% - 2px)`;
    }

    setHover(i: number) {
        if (this.interactive && this.loggedIn) {
            this.activeHover = i;
        }
    }

    selectRating(value: number) {
        if (this.interactive && this.loggedIn) {
            this.selectedRating.emit(value);
        }
    }

    reset() {
        // reset the hover
        this.activeHover = -1;
    }
}
