import { Component, AfterViewInit, HostListener } from "@angular/core";
import { NgFor } from "@angular/common";

@Component({
    selector: "clark-maintenance-page",
    templateUrl: "./maintenance-page.component.html",
    styleUrls: ["./maintenance-page.component.scss"],
    standalone: true,
    imports: [NgFor],
})
export class MaintenancePageComponent implements AfterViewInit {
    cogs: any[];

    @HostListener("window:resize") resizeHandler() {
        this.countCogs();
    }

    constructor() {}

    ngAfterViewInit() {
        this.countCogs();
    }

    countCogs() {
        // each cog is either 125 or 100 pixels wide
        const windowWidth = window.innerWidth;
        this.cogs = new Array(Math.ceil(windowWidth / 100) + 2);
    }
}
