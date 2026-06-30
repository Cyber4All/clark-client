import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { RouterLinkActive, RouterLink } from "@angular/router";

@Component({
    selector: "clark-cookie-popup",
    templateUrl: "./cookie-popup.component.html",
    styleUrls: ["./cookie-popup.component.scss"],
    standalone: true,
    imports: [RouterLinkActive, RouterLink],
})
export class CookiePopupComponent {
    @Output() acceptsCookie: EventEmitter<boolean> = new EventEmitter();

    agree() {
        this.acceptsCookie.emit(true);
    }
}
