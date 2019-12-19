import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { LearningObjectService } from 'app/core/learning-object.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'clark-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  learningObject: LearningObject;
  private isDestroyed$ = new Subject<void>();

  // flags
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private titleService: Title,
    ) { }

  ngOnInit() {
    this.route.params.subscribe(async ({ username, learningObjectName }: { username: string, learningObjectName: string }) => {
      await this.getLearningObject(username, learningObjectName);
    });
  }

  async getLearningObject(username: string, cuid: string, version?: number) {
    this.loading = true;
    const params = {
      author: username,
      cuidInfo: {
        cuid: cuid,
        version: version,
      }
    };
    await this.learningObjectService.fetchLearningObject(params).pipe(takeUntil(this.isDestroyed$)).subscribe(async (object) => {
      if (object) {
        this.learningObject = object;
        this.titleService.setTitle(this.learningObject.name + '| CLARK');
      }
    });
    this.loading = false;
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
