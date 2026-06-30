import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TipDirective } from "../../../../shared/directives/tip.directive";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";
import { SlicePipe, DatePipe } from "@angular/common";

@Component({
    selector: "clark-notification-card",
    templateUrl: "./notification-card.component.html",
    styleUrls: ["./notification-card.component.scss"],
    standalone: true,
    imports: [TipDirective, ActivateDirective, SlicePipe, DatePipe],
})
export class NotificationCardComponent implements OnInit {
    @Input() notification: {
        text: string;
        timestamp: string;
        link: string;
        attributes: any;
    };

    @Output() deleteButtonClicked = new EventEmitter<Event>();
    @Output() changeLogButtonClicked = new EventEmitter<Event>();
    @Output() detailsButtonClicked = new EventEmitter<Event>();
    constructor() {}

    ngOnInit() {}

    onDeleteButtonClick(e: Event) {
        this.deleteButtonClicked.emit(e);
    }

    onChangelogButtonClick(e: Event) {
        this.changeLogButtonClicked.emit(e);
    }

    onDetailsButtonClick(e: Event) {
        this.detailsButtonClicked.emit(e);
    }
}
