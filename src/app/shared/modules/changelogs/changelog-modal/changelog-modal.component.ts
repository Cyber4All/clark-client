import { Component, OnInit, Input } from "@angular/core";
import { LearningObject } from "@entity";
import { NgIf, DatePipe } from "@angular/common";
import { ChangelogListComponent } from "../changelog-list/changelog-list.component";

@Component({
    selector: "clark-changelog-modal",
    templateUrl: "./changelog-modal.component.html",
    styleUrls: ["./changelog-modal.component.scss"],
    standalone: true,
    imports: [NgIf, ChangelogListComponent, DatePipe],
})
export class ChangelogModalComponent implements OnInit {
    @Input() learningObject: LearningObject;
    @Input() changelogs: any;
    @Input() loading: boolean;

    constructor() {}

    ngOnInit() {}
}
