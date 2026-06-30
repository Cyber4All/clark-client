import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ActivateDirective } from "../../../../../shared/directives/activate.directive";

@Component({
    selector: "clark-secinj-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
    standalone: true,
    imports: [ActivateDirective],
})
export class SecurityInjectionsHeaderComponent implements OnInit {
    @Input() collectionAbv: string;
    constructor(private router: Router) {}

    ngOnInit(): void {}

    navigateToBrowse() {
        this.router.navigate(["/browse"], {
            queryParams: { collection: this.collectionAbv, currPage: 1 },
        });
    }
}
