import { Component, OnInit } from "@angular/core";
import { ActivateDirective } from "../../shared/directives/activate.directive";

@Component({
    selector: "clark-donate",
    templateUrl: "./donate.component.html",
    styleUrls: ["./donate.component.scss"],
    standalone: true,
    imports: [ActivateDirective],
})
export class DonateComponent implements OnInit {
    constructor() {}

    ngOnInit() {}

    donate() {
        window.open(
            "https://towsonuniversity.givingfuel.com/cybersecurity-education-initiatives",
            "_blank",
        );
    }
}
