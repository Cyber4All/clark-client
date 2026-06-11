import { Component, Input, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { CollectionLearningObjectListComponent } from '../collection-learning-object-list/collection-learning-object-list.component';

@Component({
    selector: 'clark-feature',
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss'],
    standalone: true,
    imports: [NgClass, NgIf, CollectionLearningObjectListComponent]
})
export class FeatureComponent implements OnInit {
  @Input() collectionName: string;
  constructor() { }

  ngOnInit(): void {

  }

}
