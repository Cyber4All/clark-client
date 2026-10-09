import {
    RATING_COMMENT_LIMIT,
    ratingCommentLength,
    ratingCommentText,
    serializeRatingComment,
} from "../rating-comment";
import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter,
} from "@angular/core";
import { NgClass, NgFor } from "@angular/common";
import { TipDirective } from "../../../../shared/directives/tip.directive";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";
import { RatingEditorComponent } from "../rating-editor/rating-editor.component";

@Component({
    selector: "clark-new-rating",
    templateUrl: "./new-rating.component.html",
    styleUrls: ["./new-rating.component.scss"],
    standalone: true,
    imports: [
        NgClass,
        NgFor,
        TipDirective,
        ActivateDirective,
        RatingEditorComponent,
    ],
})
export class NewRatingComponent implements OnInit, OnChanges {
    @Input() count = 5;
    @Input() rating: { value: number; comment: string; id: string };
    @Input() editing = false;
    @Output() setRating: EventEmitter<{
        value: number;
        comment: string;
        id?: string;
        editing?: boolean;
    }> = new EventEmitter();
    @Output() cancelRating: EventEmitter<void> = new EventEmitter();
    iterableCount: number[];

    tips = ["Poor", "Needs Work", "Average", "Good", "Excellent"];

    activeHover = -1;
    activePanel = 0;

    oldRating: number;

    readonly commentLimit = RATING_COMMENT_LIMIT;

    get commentLength(): number {
        return ratingCommentLength(this.rating?.comment);
    }

    get isSubmitDisabled(): boolean {
        // Empty editor markup is not a review; the limit counts decoded text, not HTML.
        return (
            !ratingCommentText(this.rating?.comment).trim() ||
            this.commentLength > this.commentLimit
        );
    }

    ngOnInit() {
        this.iterableCount = Array.from(
            { length: this.count },
            (_, index) => index,
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.count) {
            this.iterableCount = Array(changes.count.currentValue).fill(0);
        }

        if (changes.rating) {
            if (!changes.rating.isFirstChange || changes.rating.currentValue) {
                this.advance();
            }
        }
    }

    regress() {
        this.activePanel = 0;
    }

    advance() {
        this.activePanel = 1;
    }

    setHover(i: number) {
        this.activeHover = i;
    }

    reset() {
        // reset the hover
        this.activeHover = -1;
    }

    rate(i: number) {
        this.rating.value = i;
        this.activePanel = 1;
        this.activeHover = -1;
    }

    submitRating() {
        if (this.isSubmitDisabled) {
            return;
        }
        this.setRating.emit({
            ...this.rating,
            // Convert only on submission so normalizing markup cannot move the live caret.
            comment: serializeRatingComment(this.rating.comment),
            editing: this.editing,
        });
    }

    cancel() {
        this.cancelRating.emit();
    }

    starShouldShow(i: number): boolean {
        return (
            (this.activeHover !== -1 && i <= this.activeHover) ||
            (this.activeHover === -1 && this.rating && i < this.rating.value)
        );
    }
}
