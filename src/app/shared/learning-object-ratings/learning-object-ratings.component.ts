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

  @Input() ratings: {user: User, number: number, comment: string, date: string}[];
  @Input() averageRating: number;
  @Input() loggedIn: boolean;
  @Output() editRating = new EventEmitter();
  @Output() deleteRating = new EventEmitter();
  @Output() reportRating: EventEmitter<{concern: string, index: number, comment?: string}> = new EventEmitter();

  showReport = false;
  reportIndex: number;

  constructor(public userService: UserService, private auth: AuthService) { }

  ngOnInit() { }

  calculateAverageRating(): number {
    if (this.ratings.length > 0) {
      return this.ratings.map(x => x.number).reduce((x, y) => x + y) / this.ratings.length;
    }
  }

  getDate(seconds: string): Date {
    const t = new Date( parseInt( seconds, 16 ) * 1000 );
    return t;
  }

  isAuthor(index: number): boolean {
    if (this.ratings[index].user.username === this.auth.username) {
      return true;
    }
    return false;
  }

  submitEditRating(index: number) {
    const editRating =  {
      number: this.ratings[index].number,
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

}
