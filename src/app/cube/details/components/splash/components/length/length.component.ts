import { Component, OnInit, Input } from "@angular/core";
import { NgIf, TitleCasePipe } from "@angular/common";

@Component({
    selector: "clark-details-splash-length",
    templateUrl: "./length.component.html",
    styleUrls: ["./length.component.scss"],
    standalone: true,
    imports: [NgIf, TitleCasePipe],
})
export class LengthComponent implements OnInit {
    @Input() length:
        | "nanomodule"
        | "micromodule"
        | "module"
        | "unit"
        | "course";

    constructor() {}

    ngOnInit() {}
}
