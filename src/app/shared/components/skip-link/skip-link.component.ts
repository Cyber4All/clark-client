import { Component, OnInit, Input } from "@angular/core";
import { ActivateDirective } from "../../directives/activate.directive";

@Component({
    selector: "clark-skip-link",
    templateUrl: "./skip-link.component.html",
    styleUrls: ["./skip-link.component.scss"],
    standalone: true,
    imports: [ActivateDirective],
})
export class SkipLinkComponent implements OnInit {
    @Input() title: string;
    @Input() skipLocation: string;
    @Input() identity: string;
    constructor() {}

    ngOnInit() {}

    goToContent(value: string) {
        document.getElementById(value).focus();
    }
}
