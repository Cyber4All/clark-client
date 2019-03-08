import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObjectService as PublicLearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as PrivateLearningObjectService } from 'app/onion/core/learning-object.service';
import { Query } from 'app/shared/interfaces/query';
import { LearningObject } from '@cyber4all/clark-entity';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [
    PublicLearningObjectService,
    PrivateLearningObjectService
  ]
})
export class LearningObjectsComponent implements OnInit, OnDestroy {

  learningObjects: any;
  searchBarPlaceholder = 'Learning Objects';
  loading = false;
  displayStatusModal = false;
  activeLearningObject;
  adminStatusList =  Object.keys(LearningObject.Status);
  selectedStatus: string;
  componentDestroyed$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.componentDestroyed$),
      )
      .subscribe(u => this.getUserLearningObjects(u.username));
  }

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private privateLearningObjectService: PrivateLearningObjectService,
    private route: ActivatedRoute,
  ) { }

  getLearningObjects(text: string) {
    this.loading = true;
    const query: Query = {
      text
    };
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.loading = false;
      });
  }

  getUserLearningObjects(author: string) {
    this.loading = true;
    const query = {
      text: author
    };
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.loading = false;
      });
  }

  openChangeStatusModal(learningObject: LearningObject) {
    this.displayStatusModal = true;
    this.activeLearningObject = learningObject;
  }

  updateLearningObjectStatus() {
    this.privateLearningObjectService.save(
      this.activeLearningObject.id,
      this.activeLearningObject.author.username,
      { status: this.selectedStatus }
    );
    this.displayStatusModal = false;
  }

  isCurrentStatus(status: string) {
    return this.activeLearningObject.status === status.toLowerCase();
  }

  toggleStatus(status: string) {
    this.selectedStatus = status.toLowerCase();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
 }
