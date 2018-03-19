import { Component, OnInit, Input } from '@angular/core';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AcademicLevel } from '@cyber4all/clark-entity';

// TODO: Apply .bad to input if the form is submitted and it's not valid

@Component({
  selector: 'onion-learning-object-metadata',
  templateUrl: 'metadata.component.html',
  styleUrls: [ 'metadata.component.scss' ]
})
export class LearningObjectMetadataComponent implements OnInit {
  @Input() isNew;
  @Input() learningObject;

  public tips = TOOLTIP_TEXT;
  validName = /([A-Za-z0-9_()`~!@#$%^&*+={[\]}\\|:;"'<,.>?/-]+\s*)+/i;
  academicLevels = Object.values(AcademicLevel);

  constructor() { }

  ngOnInit() { }

  toggleLevel(level: AcademicLevel) {
    const index = this.learningObject.levels.indexOf(level);
    if (index > -1) {
      this.learningObject.removeLevel(index);
    } else {
      this.learningObject.addLevel(level);
    }
  }
}
