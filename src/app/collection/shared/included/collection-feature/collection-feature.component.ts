import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LearningObject } from '../../../../../entity/learning-object/learning-object';
import { Router } from '@angular/router';
import { CollectionService } from '../../../../core/collection.service';

@Component({
  selector: 'clark-collection-feature',
  templateUrl: './collection-feature.component.html',
  styleUrls: ['./collection-feature.component.scss']
})
export class CollectionFeatureComponent implements OnInit, OnChanges {

  @Input()learningObjects: LearningObject[];
  @Input()primaryColor: string;
  @Input()collection: string;
  theme = 'dark';
  constructor(
    private router: Router,
    private collectionService: CollectionService
  ) { }

  ngOnInit(): void {
    this.setColorScheme();
  }

  ngOnChanges(): void {
    this.collectionService.darkMode502.subscribe(mode => {
      this.theme = mode ? 'dark' : 'light';
    });
  }

  setColorScheme() {
    const header = document.getElementById('header');
    header!.style.color = this.primaryColor;
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collection, currPage: 1 }});
  }


}
