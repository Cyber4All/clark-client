import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'clark-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {

  @Input() files: LearningObject.Material.File[];

  ngOnInit(): void {}

}
