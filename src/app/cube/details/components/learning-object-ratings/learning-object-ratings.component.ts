import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@entity';
import { AuthService } from 'app/core/auth-module/auth.service';
import { UserService } from 'app/core/user-module/user.service';
import { NgClass, DatePipe } from '@angular/common';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { RouterLink } from '@angular/router';
import { ActivateDirective } from '../../../../shared/directives/activate.directive';
import { NewRatingResponseComponent } from '../new-rating-response/new-rating-response.component';
import { ReportRatingComponent } from '../report-rating/report-rating.component';
import { PopupComponent } from '../../../../shared/modules/popups/popup.component';

@Component({
    selector: 'clark-learning-object-ratings',
    templateUrl: './learning-object-ratings.component.html',
    styleUrls: ['./learning-object-ratings.component.scss'],
    standalone: true,
    imports: [RatingStarsComponent, RouterLink, ActivateDirective, NewRatingResponseComponent, NgClass, ReportRatingComponent, PopupComponent, DatePipe]
})
export class LearningObjectRatingsComponent implements OnInit {

  @Input() ratings: { user: User, value: number, comment: string, date: string, response: object }[];
  @Input() learningObjectOwners: string[];
  @Input() averageRating: number;
  @Input() loggedIn: boolean;
  @Output() editRating = new EventEmitter();
  @Output() deleteRating = new EventEmitter();
  @Output() editResponse = new EventEmitter();
  @Output() deleteResponse = new EventEmitter();
  @Output() respondRating: EventEmitter<{ comment: string }> = new EventEmitter();
  @Output() reportRating: EventEmitter<{ concern: string, index: number, comment?: string }> = new EventEmitter();

  showReport = false;
  reportIndex: number;
  showResponse = [];
  showEditResponse = [];
  deleteConfirmation: boolean;
  deleteResponseConfirmation: boolean;
  deleteRatingIndex: number;
  deleteResponseIndex: number;

  constructor(public userService: UserService, private auth: AuthService) { }

  ngOnInit() { }

  calculateAverageRating(): number {
    if (this.ratings.length > 0) {
      return this.ratings.map(x => x.value).reduce((x, y) => x + y) / this.ratings.length;
    }
  }

  isRatingAuthor(index: number): boolean {
    if (this.ratings[index].user.username === this.auth.username) {
      return true;
    }
    return false;
  }

  isResponseAuthor(index: number): boolean {
    if (this.ratings[index].response[0].user.username === this.auth.username) {
      return true;
    }
    return false;
  }

  isLearningObjectOwner(): boolean {
    return this.learningObjectOwners.includes(this.auth.username);
  }

  submitEditRating(index: number) {
    const editRating = {
      number: this.ratings[index].value,
      comment: this.ratings[index].comment,
      index: index
    };
    this.editRating.emit(editRating);
  }

  submitDeleteRating(index: number) {
    this.deleteRatingIndex = index;
    this.deleteConfirmation = true;
  }

  submitDeleteResponse(index: number) {
    this.deleteResponseIndex = index;
    this.deleteResponseConfirmation = true;
  }

  triggerReportRating(report: { concern: string, comment?: string }) {
    this.reportRating.emit({ ...report, index: this.reportIndex });
    this.showReport = false;
  }

  submitResponse(response: { index: number, comment: string }) {
    this.cancelResponse(response.index);
    this.respondRating.emit(response);
  }

  submitEditResponse(response: { comment: string, index: number }) {
    this.editResponse.emit(response);
  }


  openResponse(index: number) {
    this.showResponse.push(index);
  }

  openEditResponse(index: number) {
    this.showEditResponse.push(index);
  }

  isWritingResponse(index: number) {
    return this.showResponse.includes(index);
  }

  isEditingResponse(index: number) {
    return this.showEditResponse.includes(index);
  }

  cancelResponse(element: number) {
    const index = this.showResponse.indexOf(element);
    if (index > -1) {
      this.showResponse.splice(index, 1);
    }
  }

  cancelEditResponse(element: number) {
    const index = this.showEditResponse.indexOf(element);
    if (index > -1) {
      this.showEditResponse.splice(index, 1);
    }
  }
}
