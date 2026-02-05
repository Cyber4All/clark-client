import { Component, OnInit, Input} from '@angular/core';
import { ClientRequest } from 'http';

@Component({
  selector: 'clark-hierarchies',
  templateUrl: './hierarchies.component.html',
  styleUrls: ['./hierarchies.component.scss']
})
export class HierarchiesComponent implements OnInit {
  length: 'nanomodule' | 'micromodule' | 'module' | 'unit' | 'course';

  constructor() { }

  ngOnInit(): void {}

  getHierarchyTooltip(hierarchyLevel: string): string {
    const tooltipMap = {
      'course': '15 weeks',
      'unit': 'Over 10 Hours',
      'module': '4 - 10 Hours',
      'micromodule': '1 - 4 Hours',
      'nanomodule': 'Less than 1 Hour'
    };
    return tooltipMap[hierarchyLevel] || '';
  }
}
