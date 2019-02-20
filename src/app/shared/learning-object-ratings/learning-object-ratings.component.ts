import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@cyber4all/clark-entity';
import { UserService } from '../../core/user.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'clark-learning-object-ratings',
  templateUrl: './learning-object-ratings.component.html',
  styleUrls: ['./learning-object-ratings.component.scss']
})
export class LearningObjectRatingsComponent implements OnInit {

  @Input() ratings: {user: User, value: number, comment: string, date: string}[];
  @Input() learningObjectOwners: string[];
  @Input() averageRating: number;
  @Input() loggedIn: boolean;
  @Output() editRating = new EventEmitter();
  @Output() deleteRating = new EventEmitter();
  @Output() respondRating: EventEmitter<{comment: string}> = new EventEmitter();
  @Output() reportRating: EventEmitter<{concern: string, index: number, comment?: string}> = new EventEmitter();

  showReport = false;
  reportIndex: number;
  showResponse = [];

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

  isLearningObjectOwner(): boolean {
    return this.learningObjectOwners.includes(this.auth.username);
  }

  submitEditRating(index: number) {
    const editRating =  {
      number: this.ratings[index].value,
      comment: this.ratings[index].comment,
      index: index
    };
    console.log(editRating);
    this.editRating.emit(editRating);
  }

  submitDeleteRating(index: number) {
    this.deleteRating.emit(index);
  }

  triggerReportRating(report: {concern: string, comment?: string}) {
    this.reportRating.emit({...report, index: this.reportIndex});
    this.showReport = false;
  }

  submitResponse(response: {index: number, comment: string}) {
    this.respondRating.emit(response);
  }

  openResponse(index: number) {
    this.showResponse.push(index);
  }

  isWritingResponse(index: number) {
    return this.showResponse.includes(index);
  }

  cancelResponse(element: number) {
    const index = this.showResponse.indexOf(element);
    if (index > -1) {
      this.showResponse.splice(index, 1);
    }
  }
}
