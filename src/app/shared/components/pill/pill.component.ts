import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "clark-pill",
    templateUrl: "./pill.component.html",
    styleUrls: ["./pill.component.scss"],
    standalone: true,
    imports: [NgIf],
})
export class PillComponent {
    @Input() label = "";
    @Input() active = false;
    @Input() ariaLabel = "";
    @Input() disabled = false;
    @Input() showSelectedIcon = false;
    @Input() emphasizeActive = true;

    @Output() selected: EventEmitter<void> = new EventEmitter<void>();

    handleClick(): void {
        if (!this.disabled) {
            this.selected.emit();
        }
    }
}
