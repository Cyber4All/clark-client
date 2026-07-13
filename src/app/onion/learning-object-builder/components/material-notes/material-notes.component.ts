import { Component, Input } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { TipDirective } from "../../../../shared/directives/tip.directive";

@Component({
    selector: "clark-material-notes",
    templateUrl: "./material-notes.component.html",
    styleUrls: ["./material-notes.component.scss"],
    standalone: true,
    imports: [NgClass, NgIf, TipDirective],
})
export class MaterialNotesComponent {
    open = false;
    @Input() note: { title: string; content: string; tip?: string };

    openNote(): void {
        this.open = !this.open;
    }
}
