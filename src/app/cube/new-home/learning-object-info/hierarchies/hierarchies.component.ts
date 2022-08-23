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

  hierarchy = [];
  //Below uses a sample hierarchy from the Intro to Cybersecurity course
  ngOnInit(): void {
    this.hierarchy.push({name: 'Intro to Cybersecurity', length: 'course'});
    this.hierarchy.push({name: 'Cyber Foundations', length: 'micromodule'});
    this.hierarchy.push({name: 'Cybersecurity Case Studies', length: 'nanomodule'});
    this.hierarchy.push({name: 'Cyber War', length: 'micromodule'});
    this.hierarchy.push({name: 'Cyberwarfare Exercise', length: 'nanomodule'});
    this.hierarchy.push({name: 'Network Security', length: 'micromodule'});
    this.hierarchy.push({name: 'Network Security Lab', length: 'nanomodule'});
    this.hierarchy.push({name: 'Secure Software', length: 'micromodule'});
  }
}
