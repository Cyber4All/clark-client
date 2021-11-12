import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-collection-feature',
  templateUrl: './collection-feature.component.html',
  styleUrls: ['./collection-feature.component.scss']
})
export class CollectionFeatureComponent implements OnInit {

  @Input() learningObjects: LearningObject[];
  @Input() primaryColor: string;
  constructor() { }

  ngOnInit(): void {
    this.setColorScheme();
  }

  setColorScheme() {
    const header = document.getElementById('header');
    header.style.color = this.primaryColor;
  }

}
