import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NgIf } from "@angular/common";

@Component({
    selector: "clark-unauthorized",
    templateUrl: "./unauthorized.component.html",
    styleUrls: ["./unauthorized.component.scss"],
    standalone: true,
    imports: [NgIf, RouterLink],
})
export class UnauthorizedComponent implements OnInit {
    statusCode: string;
    redirectUrl: string;
    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.statusCode = params.get("code");
            this.redirectUrl = params.get("redirect");
        });
    }
}
