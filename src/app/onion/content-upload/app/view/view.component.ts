import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../../../core/learning-object.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TimeFunctions } from '../time-functions';
import { NotificationService } from '../../../../shared/notifications';

@Component({
  selector: 'neutrino-view',
  templateUrl: './view.component.html',
  styleUrls: ['../../styles.css', './view.component.scss']
})
export class ViewComponent implements OnInit {
  learningObjectName: string;
  learningObject: LearningObject;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private lobjectService: LearningObjectService,
    private notifications: NotificationService
  ) {}

  ngOnInit() {
    this.learningObjectName = this.route.snapshot.params.learningObjectName;
    this.learningObjectName
      ? this.fetchLearningObject()
      : this.router.navigate(['/onion/dashboard']);
  }
  /**
   * Fetches Learning Object by name
   *
   * @private
   * @memberof ViewComponent
   */
  private async fetchLearningObject() {
    try {
      this.learningObject = await this.lobjectService.getLearningObject(
        this.learningObjectName
      );
      this.watchTimestamps();
    } catch (e) {
      this.notifications.notify(
        `Could not fetch Learning Object`,
        `${e}`,
        `bad`,
        ``
      );
    }
  }
  /**
   * Adds a human readable representation of time elapsed since file was added
   *
   * @private
   * @memberof ViewComponent
   */
  private watchTimestamps() {
    let interval = 1000;
    const MINUTE = 60000;
    setInterval(() => {
      // After initial pass only update every minute
      interval = MINUTE;
      this.learningObject.materials.files.map(file => {
        file['timeAgo'] = TimeFunctions.getTimestampAge(+file.date);
        return file;
      });
    }, interval);
  }
}
