import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { Router } from '@angular/router';
import { CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-collection-feature',
  templateUrl: './collection-feature.component.html',
  styleUrls: ['./collection-feature.component.scss']
})
export class CollectionFeatureComponent implements OnInit {

  @Input() learningObjects: LearningObject[];
  @Input() primaryColor: string;
  @Input() collection: string;
  theme = 'light';
  constructor(
    private router: Router,
    private collectionService: CollectionService
  ) { }

  ngOnInit(): void {
    this.setColorScheme();
    this.collectionService.darkMode502.subscribe(mode => {
      if(mode){
        this.theme = 'dark';
      } else{
        this.theme = 'light';
      }
    });
  }

  setColorScheme() {
    const header = document.getElementById('header');
    header.style.color = this.primaryColor;
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collection, currPage: 1 }});
  }


}
