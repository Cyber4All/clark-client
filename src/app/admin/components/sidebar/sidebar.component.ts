import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subject } from "rxjs";
import { Collection } from "app/core/collection-module/collections.service";
import { sidebarAnimations } from "./sidebar.component.animation";
import { AuthService } from "app/core/auth-module/auth.service";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ActivateDirective } from "../../../shared/directives/activate.directive";
import { NgIf, NgTemplateOutlet, NgFor, NgClass } from "@angular/common";

@Component({
    selector: "clark-admin-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"],
    animations: sidebarAnimations,
    standalone: true,
    imports: [
        ActivateDirective,
        NgIf,
        NgTemplateOutlet,
        RouterLink,
        RouterLinkActive,
        NgFor,
        NgClass,
    ],
})
export class SidebarComponent implements OnInit, OnDestroy {
    destroyed$: Subject<void> = new Subject();

    @Input() collections: Collection[] = [];
    @Input() activeCollection: string;
    @Input() editorMode: boolean;

    @Input() initialized = false;

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    ngOnInit() {}

    goBack() {
        this.router.navigate([""]);
    }

    isAdminOrEditor(): boolean {
        return this.authService.isAdminOrEditor();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.unsubscribe();
    }
}
