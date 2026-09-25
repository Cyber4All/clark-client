import { AsyncPipe, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

import { ThemeService } from "app/core/theme-module/theme.service";

@Component({
    selector: "clark-theme-selector",
    standalone: true,
    imports: [AsyncPipe, NgIf],
    templateUrl: "./theme-selector.component.html",
    styleUrl: "./theme-selector.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSelectorComponent {
    constructor(public readonly theme: ThemeService) {}

    toggleHalloweenTheme(event: Event): void {
        const input = event.target;

        if (input instanceof HTMLInputElement) {
            this.theme.toggleHalloweenTheme(input.checked);
        }
    }
}
