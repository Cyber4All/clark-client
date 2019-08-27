import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { LearningObjectService } from 'app/cube/learning-object.service';

@Component({
  selector: 'clark-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  learningObject: LearningObject;

  // flags
  loading: boolean;

  constructor(private route: ActivatedRoute, private learningObjectService: LearningObjectService) { }

  ngOnInit() {
    this.route.params.subscribe(({ username, learningObjectName }: { username: string, learningObjectName: string }) => {
      this.getLearningObject(username, learningObjectName);
    });
  }

  async getLearningObject(username: string, learningObjectName: string) {
    this.loading = true;
    this.learningObject = await this.learningObjectService.getLearningObject(username, learningObjectName);
    this.loading = false;
  }

}
