import { Component, Input, OnInit } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

import { MatDivider } from '@angular/material/divider';

interface CollectionFaq {
  question: String
  answer: String
}

@Component({
    selector: 'clark-faq-section',
    templateUrl: './faq-section.component.html',
    styleUrls: ['./faq-section.component.scss'],
    standalone: true,
    imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatDivider]
})
export class FaqSectionComponent implements OnInit {

  @Input() faq: CollectionFaq[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
