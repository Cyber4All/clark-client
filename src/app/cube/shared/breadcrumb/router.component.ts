import { Component, OnInit } from '@angular/core';

@Component({
    template: `
    <router-outlet></router-outlet>
  `
})
/**
 * Empty component that functions as a mediator and router-outlet between components due to the nature of our routing
 */
export class RouterComponent implements OnInit {
    constructor() { }
    ngOnInit() {
    }
}
