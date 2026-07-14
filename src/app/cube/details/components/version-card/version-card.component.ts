import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
    selector: "clark-version-card",
    templateUrl: "./version-card.component.html",
    styleUrls: ["./version-card.component.scss"],
    standalone: true,
    imports: [NgIf, RouterLink],
})
export class VersionCardComponent {
    @Input() showButton: boolean;
    @Input() version: number;
    @Output() clickButtonEvent: EventEmitter<void> = new EventEmitter();

    emitClickButtonEvent(): void {
        this.clickButtonEvent.emit();
    }
}
