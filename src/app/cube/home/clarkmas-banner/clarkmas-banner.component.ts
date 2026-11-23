import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "clark-clarkmas-banner",
    standalone: true,
    templateUrl: "./clarkmas-banner.component.html",
    styleUrl: "./clarkmas-banner.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClarkmasBannerComponent {}
