import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss']
})
export class LearningObjectsComponent implements OnInit {
  featuredObjects: LearningObject[];

  constructor(private featureService: FeaturedObjectsService) { }

  ngOnInit(): void {
    this.featureService.getFeaturedObjects();
    this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObjects = objects;
    });
  }

}
