import { Component, NgModule, OnInit } from '@angular/core';
import { sections } from './copy';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

@Component({
    selector: 'clark-editorial-process',
    templateUrl: './editorial-process.component.html',
    styleUrls: ['./editorial-process.component.scss'],
    standalone: true,
    imports: [MatTabGroup, NgFor, MatTab, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle]
})
export class EditorialProcessComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

  title = 'Editorial Process';

  get tabs(){
    return Object.values(sections);
  }
}
