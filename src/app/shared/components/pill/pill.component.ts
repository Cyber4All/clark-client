import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "clark-pill",
    templateUrl: "./pill.component.html",
    styleUrls: ["./pill.component.scss"],
    standalone: true,
})
export class PillComponent {
    @Input() label = "";
    @Input() active = false;
    @Input() ariaLabel = "";
    @Input() disabled = false;

    @Output() selected: EventEmitter<void> = new EventEmitter<void>();

    handleClick(): void {
        if (!this.disabled) {
            this.selected.emit();
        }
    }
}
