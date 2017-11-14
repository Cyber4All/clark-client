import { LearningObjectService } from './learning-object.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  openMenu = false;
  // FIXME: Convert 'class' to 'type' for consistancy

  constructor(public service: LearningObjectService) {
  }

  /* TODO: This function is no longer used in the template, however the general spoof functionality will be needed later.
           Remove comment block when implemented.

   spoofFilter(value) {
    console.log(value);
    if (value !== 'all') {
      this.filteredGroups = [
      {
        title: 'Course - 15 weeks',
        learningObjects: [
          { topic: 'Cybersecurity for Future Presidents', class: 'Course' }
        ]
      },
    ];
    } else {
      this.filteredGroups = undefined;
    }
  }
  */
}
