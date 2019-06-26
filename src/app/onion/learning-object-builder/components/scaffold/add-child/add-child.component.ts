import { Component, OnInit, Input, Output } from '@angular/core';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-add-child',
  templateUrl: './add-child.component.html',
  styleUrls: ['./add-child.component.scss']
})
export class AddChildComponent implements OnInit {
  // the child that is currently being edited
  @Input() child: LearningObject;
  // emits the child that is to be added to the children array
  @Output() childToAdd: LearningObject;

  children: LearningObject[];
  loading: boolean;

  constructor(
    private learningObjectService: LearningObjectService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    setTimeout(async() => {
      this.children = await this.getLearningObjects();
    });
  }

  async getLearningObjects(filters?: any): Promise<LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects(this.auth.username, filters)
      .then((children: LearningObject[]) => {
        this.loading = false;
        return children;
      });
    }
}
