import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { sections } from './copy';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { AboutPhilosophyComponent } from './philosophy/philosophy.component';

@Component({
    selector: 'clark-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss'],
    standalone: true,
    imports: [MatTabGroup, MatTab, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, AboutPhilosophyComponent]
})
export class AboutClarkComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

  title = 'About Us';

  get tabs() {
    return Object.values(sections);
  }
}
