import { Component, OnInit } from "@angular/core";
import { default as events } from "../../../../../assets/events.json";
import { NgFor, NgIf } from "@angular/common";

@Component({
    selector: "clark-timeline",
    templateUrl: "./timeline.component.html",
    styleUrls: ["./timeline.component.scss"],
    standalone: true,
    imports: [NgFor, NgIf],
})
export class TimelineComponent implements OnInit {
    events = events;

    constructor() {}
    ngOnInit() {}
}
