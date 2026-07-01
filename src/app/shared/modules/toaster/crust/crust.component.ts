import { Component, OnInit } from "@angular/core";
import { ToastrOvenComponent } from "../notification/notification.component";

@Component({
    selector: "clark-toaster-crust",
    template: "<clark-toastr-oven></clark-toastr-oven>",
    standalone: true,
    imports: [ToastrOvenComponent],
})
export class CrustComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
