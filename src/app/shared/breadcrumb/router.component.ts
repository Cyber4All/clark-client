import { Component, OnInit } from "@angular/core";

@Component({
    template: `
    <router-outlet></router-outlet>
  `
})
export class RouterComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}