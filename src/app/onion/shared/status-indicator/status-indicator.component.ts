import { Component, Input } from "@angular/core";
import { NgIf, NgClass } from "@angular/common";
import { TipDirective } from "../../../shared/directives/tip.directive";
import {
    getLearningObjectStatusIcon,
    getLearningObjectStatusLabel,
} from "app/shared/functions/learning-object-status";

@Component({
    selector: "clark-lo-status-indicator",
    template: `
        <div
            *ngIf="status"
            class="top__status"
            [ngClass]="status"
            [tip]="states?.get(status)?.tip"
            [tipDisabled]="!states?.get(status)?.tip"
            [attr.aria-label]="'Learning Object Status: ' + statusLabel"
            tipPosition="bottom">
            <span><i class="fas" [ngClass]="statusIcon"></i></span>
        </div>
    `,
    styleUrls: ["status-indicator.component.scss"],
    standalone: true,
    imports: [NgIf, NgClass, TipDirective],
})
export class LearningObjectStatusIndicatorComponent {
    @Input() status;
    @Input() states;

    get statusLabel(): string {
        return getLearningObjectStatusLabel(this.status);
    }

    get statusIcon(): string {
        return getLearningObjectStatusIcon(this.status);
    }
}
