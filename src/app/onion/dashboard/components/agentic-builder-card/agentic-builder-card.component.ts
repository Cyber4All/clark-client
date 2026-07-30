import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";

import { ActivateDirective } from "../../../../shared/directives/activate.directive";

@Component({
    selector: "clark-agentic-builder-card",
    templateUrl: "./agentic-builder-card.component.html",
    styleUrls: ["./agentic-builder-card.component.scss"],
    standalone: true,
    imports: [NgIf, RouterLink, ActivateDirective],
})
export class AgenticBuilderCardComponent {
    @Input() showAnnouncement = true;
    @Input() ctaLabel = "NEW + AI";
    @Input() ctaRoute: string | any[] =
        "/onion/learning-object-builder/materials";

    @Output() dismissAnnouncement = new EventEmitter<void>();
}
