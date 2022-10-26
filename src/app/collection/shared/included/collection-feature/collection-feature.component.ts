import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { Router } from '@angular/router';

@Component({
  selector: 'clark-collection-feature',
  templateUrl: './collection-feature.component.html',
  styleUrls: ['./collection-feature.component.scss']
})
export class CollectionFeatureComponent implements OnInit {

  @Input() learningObjects: LearningObject[];
  @Input() primaryColor: string;
  @Input() collection: string;
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setColorScheme();
  }

  setColorScheme() {
    const header = document.getElementById('header');
    header.style.color = this.primaryColor;
  }

  navigateToBrowse() {
    this.router.navigate(['/browse'], { queryParams: { collection: this.collection, currPage: 1 }});
  }


}
