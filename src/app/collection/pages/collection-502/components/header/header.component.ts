import { Component, OnInit } from "@angular/core";
import { HeaderInfo502Component } from "./header-info/header-info.component";
@Component({
    selector: "clark-502-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.scss"],
    standalone: true,
    imports: [HeaderInfo502Component],
})
export class Header502Component implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
