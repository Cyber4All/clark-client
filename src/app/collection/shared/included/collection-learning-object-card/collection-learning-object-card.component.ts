import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'clark-collection-learning-object-card',
  templateUrl: './collection-learning-object-card.component.html',
  styleUrls: ['./collection-learning-object-card.component.scss']
})
export class CollectionLearningObjectCardComponent implements OnInit {
  @Input() learnObj = new Input();
  constructor() { }

  ngOnInit(): void {

  }

}
