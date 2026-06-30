import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgClass } from "@angular/common";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";

@Component({
    selector: "clark-new-rating-response",
    templateUrl: "./new-rating-response.component.html",
    styleUrls: ["./new-rating-response.component.scss"],
    standalone: true,
    imports: [FormsModule, NgClass, ActivateDirective],
})
export class NewRatingResponseComponent implements OnInit {
    @Input() response: { comment: string; index: number };
    @Input() editing = false;
    @Output() cancel: EventEmitter<number> = new EventEmitter();
    @Output() submit: EventEmitter<{ comment: string; index: number }> =
        new EventEmitter();

    ngOnInit() {}

    submitResponse() {
        this.submit.emit(this.response);
    }

    cancelResponse() {
        this.cancel.emit(this.response.index);
    }
}
