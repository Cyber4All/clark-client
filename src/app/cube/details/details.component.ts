import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject, User } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { LearningObjectService } from 'app/core/learning-object.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserService } from 'app/core/user.service';

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

  academicLevelMetadata = [
    {
      category: 'K-12',
      academicLevels: {
        elementary: false,
        middle: false,
        high: false,
      },
    },
    {
      category: 'College',
      academicLevels: {
        undergraduate: false,
        graduate: false,
        'post graduate': false,
      },
    },
    {
      category: 'Corporate',
      academicLevels: {
        training: false,
      },
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private titleService: Title,
    private userService: UserService,
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
    const resources = ['children', 'parents', 'outcomes', 'materials', 'metrics', 'ratings'];
      await this.learningObjectService.fetchLearningObjectWithResources(
        { author: 'nvisal1237', cuidInfo: { cuid }}, resources
        ).pipe(takeUntil(this.isDestroyed$)).subscribe(async (object) => {
        if (object) {
          this.learningObject = object;
        this.setAcademicLevels();

        this.titleService.setTitle(this.learningObject.name + '| CLARK');
      }
    });
    this.loading = false;
  }

  setAcademicLevels() {
    this.learningObject.levels.forEach(level => {
      this.academicLevelMetadata.forEach(data => {
        if (data.academicLevels[level] === false) {
          data.academicLevels[level] = true;
        }
      });
    });
  }

  getGravatar(user: User) {
    return this.userService.getGravatarImage(
      user.email,
      200,
    );
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
