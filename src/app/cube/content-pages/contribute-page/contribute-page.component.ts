import { Component, OnInit } from "@angular/core";
import { sections } from "./copy";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { NgFor } from "@angular/common";
import {
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from "@angular/material/expansion";

@Component({
    selector: "clark-contribute-page",
    templateUrl: "./contribute-page.component.html",
    styleUrls: ["./contribute-page.component.scss"],
    standalone: true,
    imports: [
        MatTabGroup,
        NgFor,
        MatTab,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
    ],
})
export class ContributePageComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    title = "Contribute";
    get tabs() {
        return Object.values(sections);
    }
}
