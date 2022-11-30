import { Component, Input, OnInit } from '@angular/core';

interface CollectionFaq {
  question: String
  answer: String
}

@Component({
  selector: 'clark-faq-section',
  templateUrl: './faq-section.component.html',
  styleUrls: ['./faq-section.component.scss']
})
export class FaqSectionComponent implements OnInit {

  @Input() faq: CollectionFaq[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
