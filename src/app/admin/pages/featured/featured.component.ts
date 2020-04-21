import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss']
})
export class FeaturedComponent implements OnInit {
  learningObjects: LearningObject[];
  constructor() { }

  ngOnInit(): void {
  }

  saveFeatured() {

  }
}
