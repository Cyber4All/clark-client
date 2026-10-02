import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";

@Component({
    selector: "clark-pagination",
    templateUrl: "./pagination.component.html",
    styleUrls: ["./pagination.component.scss"],
    standalone: true,
    imports: [ActivateDirective],
})
export class PaginationComponent {
    @Input() lastPageNumber: number;
    @Input() currentPageNumber: number;

    @Output() newPageNumberClicked = new EventEmitter<number>();

    onLeftArrowClick() {
        if (this.currentPageNumber > 1) {
            this.newPageNumberClicked.emit(this.currentPageNumber - 1);
        }
    }

    onRightArrowClick() {
        if (this.currentPageNumber < this.lastPageNumber) {
            this.newPageNumberClicked.emit(this.currentPageNumber + 1);
        }
    }
}
