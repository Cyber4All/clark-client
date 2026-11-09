import { DecimalPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { GoogleTagService } from "../google-tag.service";

@Component({
    selector: "clark-cyber-awareness-banner",
    templateUrl: "./cyber-awareness-banner.component.html",
    styleUrls: ["./cyber-awareness-banner.component.scss"],
    standalone: true,
    imports: [RouterLink, DecimalPipe],
})
export class CyberAwarenessBannerComponent implements OnInit {
    numReleasedObjects = 0;
    readonly cyberAwarenessTagId = "6abd2754a6e2ead29527cbd0";

    constructor(
        public googleTagService: GoogleTagService,
        private learningObjectService: SearchService,
    ) {}

    ngOnInit(): void {
        this.learningObjectService
            .getLearningObjects({ status: ["released"] })
            .then((stats) => {
                this.numReleasedObjects = Math.floor(stats.total / 10) * 10;
            });
    }
}
